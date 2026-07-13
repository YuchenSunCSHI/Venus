#[cfg(windows)]
pub fn is_fullscreen_context() -> bool {
    windows::is_foreground_window_fullscreen()
}

#[cfg(not(windows))]
pub fn is_fullscreen_context() -> bool {
    false
}

#[cfg(windows)]
mod windows {
    use windows_sys::Win32::Foundation::{HWND, RECT};
    use windows_sys::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST};
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowRect, IsWindowVisible};

    pub fn is_foreground_window_fullscreen() -> bool {
        let window = unsafe { GetForegroundWindow() };

        if window.is_null() || unsafe { IsWindowVisible(window) } == 0 {
            return false;
        }

        let Some(window_rect) = window_rect(window) else {
            return false;
        };

        let monitor = unsafe { MonitorFromWindow(window, MONITOR_DEFAULTTONEAREST) };
        if monitor.is_null() {
            return false;
        }

        let mut monitor_info = MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFO>() as u32,
            rcMonitor: RECT::default(),
            rcWork: RECT::default(),
            dwFlags: 0,
        };

        if unsafe { GetMonitorInfoW(monitor, &mut monitor_info) } == 0 {
            return false;
        }

        covers_rect(window_rect, monitor_info.rcMonitor)
    }

    fn window_rect(window: HWND) -> Option<RECT> {
        let mut rect = RECT::default();

        if unsafe { GetWindowRect(window, &mut rect) } == 0 {
            return None;
        }

        Some(rect)
    }

    fn covers_rect(window: RECT, monitor: RECT) -> bool {
        window.left <= monitor.left
            && window.top <= monitor.top
            && window.right >= monitor.right
            && window.bottom >= monitor.bottom
    }
}