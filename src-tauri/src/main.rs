// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::env;

// 獲取平台信息
#[tauri::command]
fn get_platform() -> String {
    if cfg!(target_os = "windows") {
        "Windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macOS".to_string()
    } else if cfg!(target_os = "linux") {
        "Linux".to_string()
    } else {
        "Unknown".to_string()
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_platform])
        .setup(|app| {
            // 設定關閉時的處理邏輯
            let window = app.get_window("main").unwrap();
            window.on_window_event(|event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // 禁止預設關閉行為，讓應用可以先處理關閉邏輯
                    api.prevent_close();
                    
                    // 使用 emit 發送關閉請求，前端接收後處理
                    let window_clone = window.clone();
                    window_clone.emit("close-requested", {}).unwrap();
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}