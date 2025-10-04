// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    Window, GlobalShortcutManager, WindowBuilder, WindowUrl, LogicalPosition, LogicalSize,
};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use arboard::{Clipboard, Error};

// A simple state struct to hold the last content of the clipboard.
// This is necessary because the monitoring thread and the main thread might access it.
struct ClipboardState {
    last_content: Mutex<Option<String>>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_clipboard_text() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.get_text().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_clipboard_text(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())
}

#[tauri::command]
fn show_notification(title: String, body: String) -> Result<(), String> {
    tauri::api::notification::Notification::new("com.epitychia.app")
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
}

#[tauri::command]
fn show_ai_popup(app_handle: tauri::AppHandle, content: String) -> Result<(), String> {
    // Get cursor position (approximate center of screen for now)
    let popup_window = app_handle.get_window("ai-popup");
    
    match popup_window {
        Some(window) => {
            // Window exists, just show it and update content
            window.emit("update-content", content).map_err(|e| e.to_string())?;
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
        None => {
            // Create new popup window
            let _popup = WindowBuilder::new(
                &app_handle,
                "ai-popup",
                WindowUrl::App("ai-popup.html".into())
            )
            .title("AI Assistant")
            .inner_size(400.0, 300.0)
            .resizable(false)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .transparent(true)
            .center()
            .build()
            .map_err(|e| e.to_string())?;
            
            // Wait a moment for window to be ready, then emit content
            std::thread::sleep(Duration::from_millis(100));
            if let Some(window) = app_handle.get_window("ai-popup") {
                window.emit("update-content", content).map_err(|e| e.to_string())?;
            }
        }
    }
    
    Ok(())
}

#[tauri::command]
fn hide_ai_popup(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_window("ai-popup") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "show" => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            "hide" => {
                let window = app.get_window("main").unwrap();
                window.hide().unwrap();
            }
            _ => {}
        },
        _ => {}
    }
}

// The core clipboard monitor logic
fn start_clipboard_monitor(app_handle: AppHandle) {
    // Spawn a new thread to monitor the clipboard, which won't block the main UI thread.
    tauri::async_runtime::spawn(async move {
        // We use a new Clipboard instance for this thread, as `arboard` manages its own state
        let mut clipboard = Clipboard::new().expect("Failed to create clipboard instance.");
        let mut last_content: Option<String> = None;
        
        println!("Starting clipboard monitor...");
        
        loop {
            // Get the current content from the clipboard
            let current_content_result = clipboard.get_text();
            
            // Handle the result from the clipboard read operation
            match current_content_result {
                Ok(current_content) => {
                    // Check if content has changed, is not empty, and has more than just whitespace
                    if last_content.is_some() && current_content != last_content.as_ref().unwrap().to_string() && !current_content.trim().is_empty() {
                        
                        println!("Clipboard changed: {}", &current_content[..std::cmp::min(50, current_content.len())]);
                        
                        // Update the last known content
                        last_content = Some(current_content.clone());
                        
                        // Emit a Tauri event to the frontend
                        if let Err(e) = app_handle.emit_all("clipboard-changed", current_content.clone()) {
                            eprintln!("Failed to emit clipboard event: {}", e);
                        }
                        
                        // Show AI popup immediately when clipboard changes
                        if let Err(e) = show_ai_popup(app_handle.clone(), current_content) {
                            eprintln!("Failed to show AI popup: {}", e);
                        }
                    }
                },
                // The clipboard could be empty or contain non-UTF8 data (like an image)
                Err(Error::ContentNotUtf8) => {
                    // This is a great place to add logic for images later.
                    // For now, we'll just acknowledge the change.
                    if let Err(e) = app_handle.emit_all("clipboard-changed", "[Image/Non-Text Content]".to_string()) {
                        eprintln!("Failed to emit clipboard event for image: {}", e);
                    }
                    last_content = Some(String::new()); // Reset last_content to force a check after image
                }
                _ => {} // Ignore other errors for simplicity
            }
            
            // Poll every 500 milliseconds (0.5 seconds).
            // A shorter duration means more responsiveness but higher CPU usage.
            thread::sleep(Duration::from_millis(500));
        }
    });
}

fn main() {
    let system_tray = create_system_tray();
    
    tauri::Builder::default()
        // Here we manage the last_content, so all threads can access it safely.
        .manage(ClipboardState {
            last_content: Mutex::new(None),
        })
        .system_tray(system_tray)
        .on_system_tray_event(handle_system_tray_event)
        .setup(|app| {
            let app_handle = app.app_handle();
            
            // Spawn the clipboard monitor on application startup
            start_clipboard_monitor(app_handle.clone());
            
            // Register global shortcut
            let mut shortcut_manager = app.global_shortcut_manager();
            let window_handle = app_handle.get_window("main").unwrap();
            shortcut_manager
                .register("CmdOrCtrl+Shift+V", move || {
                    window_handle.show().unwrap();
                    window_handle.set_focus().unwrap();
                })
                .unwrap();
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_clipboard_text,
            set_clipboard_text,
            show_notification,
            show_ai_popup,
            hide_ai_popup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}