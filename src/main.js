import App from './core/App.js';

// Global app instance for debugging
let flashiApp = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Flashi application...');
        
        flashiApp = new App();
        await flashiApp.initialize();
        
        // Make app available globally for debugging
        window.flashiApp = flashiApp;
        
        // Set up global error handlers
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            flashiApp?.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            flashiApp?.handleError(new Error(event.reason));
        });

        console.log('Flashi application started successfully');
        
    } catch (error) {
        console.error('Failed to start Flashi application:', error);
        
        // Show fallback error message
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="w-full bg-white p-8 rounded-3xl shadow-lg text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h2 class="text-2xl font-bold text-red-600 mb-4">ไม่สามารถเริ่มแอปได้</h2>
                    <p class="text-gray-600 mb-6">กรุณารีโหลดหน้าเว็บและลองใหม่อีกครั้ง</p>
                    <button onclick="window.location.reload()" class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors">
                        รีโหลดหน้า
                    </button>
                </div>
            `;
        }
    }
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    if (flashiApp) {
        flashiApp.destroy();
    }
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
    window.debugFlashi = () => {
        if (flashiApp) {
            console.log('Flashi Debug Info:', flashiApp.getDebugInfo());
        } else {
            console.log('Flashi app not initialized');
        }
    };
    
    window.restartFlashi = async () => {
        if (flashiApp) {
            await flashiApp.restart();
            console.log('Flashi app restarted');
        }
    };
}