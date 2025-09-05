// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    Window, GlobalShortcutManager,
};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use clipboard::{ClipboardContext, ClipboardProvider};

struct ClipboardState {
    last_content: Mutex<String>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_clipboard_text() -> Result<String, String> {
    let mut ctx: ClipboardContext = ClipboardProvider::new()
        .map_err(|e| format!("Failed to get clipboard context: {}", e))?;
    
    ctx.get_contents()
        .map_err(|e| format!("Failed to get clipboard contents: {}", e))
}

#[tauri::command]
fn set_clipboard_text(text: String) -> Result<(), String> {
    let mut ctx: ClipboardContext = ClipboardProvider::new()
        .map_err(|e| format!("Failed to get clipboard context: {}", e))?;
    
    ctx.set_contents(text)
        .map_err(|e| format!("Failed to set clipboard contents: {}", e))
}

#[tauri::command]
fn show_notification(title: String, body: String) -> Result<(), String> {
    tauri::api::notification::Notification::new("com.epitychia.app")
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
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

fn start_clipboard_monitor(window: Window) {
    thread::spawn(move || {
        let mut last_content = String::new();
        
        println!("Starting clipboard monitor...");
        
        loop {
            match ClipboardProvider::new() {
                Ok(mut ctx) => {
                    match ctx.get_contents() as Result<String, Box<dyn std::error::Error>> {
                        Ok(current_content) => {
                            if current_content != last_content && !current_content.is_empty() && current_content.trim().len() > 0 {
                                println!("Clipboard changed: {}", &current_content[..std::cmp::min(50, current_content.len())]);
                                last_content = current_content.clone();
                                
                                // Emit clipboard change event to frontend
                                if let Err(e) = window.emit("clipboard-changed", &current_content) {
                                    println!("Failed to emit clipboard event: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            // Don't spam errors, clipboard might be temporarily unavailable
                            if e.to_string().contains("Empty") {
                                // Clipboard is empty, that's fine
                            } else {
                                println!("Clipboard read error: {}", e);
                            }
                        }
                    }
                }
                Err(e) => {
                    println!("Failed to create clipboard context: {}", e);
                    thread::sleep(Duration::from_secs(1)); // Wait longer on context creation failure
                    continue;
                }
            }
            
            thread::sleep(Duration::from_millis(1000)); // Check every second
        }
    });
}

fn main() {
    let system_tray = create_system_tray();
    
    tauri::Builder::default()
        .manage(ClipboardState {
            last_content: Mutex::new(String::new()),
        })
        .system_tray(system_tray)
        .on_system_tray_event(handle_system_tray_event)
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            // Start clipboard monitoring
            start_clipboard_monitor(window.clone());
            
            // Register global shortcut
            let mut shortcut_manager = app.global_shortcut_manager();
            shortcut_manager
                .register("CmdOrCtrl+Shift+V", move || {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                })
                .unwrap();
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_clipboard_text,
            set_clipboard_text,
            show_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}