

let result = navigator.sendBeacon(url, data);

// URL to send the data to
let url = '/api/my-endpoint';

// Create a new FormData and add a key/value pair
let data = new FormData();
data.append('hello', 'world');

let result = navigator.sendBeacon(url, data);

if (result) { 
  console.log('Successfully queued!');
} else {
  console.log('Failure.');
}

if (navigator.sendBeacon) {
  // Beacon code
} else {
  // No Beacon. Maybe fall back to XHR?
}

let startTime = performance.now();

let logVisit = function() {
  // Test that we have support
  if (!navigator.sendBeacon) return true;

  // URL to send the data to, e.g.
  let url = '/api/log-visit';

  // Data to send
  let data = new FormData();
  data.append('start', startTime);
  data.append('end', performance.now());
  data.append('url', document.URL);

  // Let's go!
  navigator.sendBeacon(url, data);
};

window.addEventListener('beforeunload', logVisit);

if (!empty($_SERVER['HTTP_DNT'])) { 
  // User does not wish to be tracked ... 
}
