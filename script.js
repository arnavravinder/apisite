const notifyBtn = document.getElementById('notify-btn');

notifyBtn.addEventListener('click', () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                registerServiceWorker().then(subscription => {
                    subscribeToServer(subscription);
                });
            } else {
                alert('Notifications denied.');
            }
        });
    } else {
        alert('This browser does not support notifications or service workers.');
    }
});

function registerServiceWorker() {
    return navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('BKOpW8kQEd0PXCcvwom9-FQLP7WRx2p_AU4dem-IKyOLapnRE0mKnY8PAhcrBac9DGFY6GaVf3NZ-fcavnEhr70')
            });
        })
        .then(subscription => {
            console.log('Service Worker registered and subscription obtained:', subscription);
            return subscription;
        })
        .catch(error => {
            console.error('Service Worker registration or subscription failed:', error);
        });
}

function subscribeToServer(subscription) {
    fetch('https://notification-api-omega.vercel.app/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Subscription sent to server:', data);
    })
    .catch(error => {
        console.error('Failed to send subscription to server:', error);
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
