let prayerTimes = {};

// Fetch prayer times on load
async function loadData() {
    try {
        // Load prayer times
        const prayerResponse = await fetch('/api/prayer-times');
        const prayerData = await prayerResponse.json();
        
        prayerTimes = prayerData.prayers;
        document.getElementById('date').textContent = prayerData.date;
        
        // Display prayer times
        Object.keys(prayerTimes).forEach(prayer => {
            document.getElementById(`time-${prayer}`).textContent = prayerTimes[prayer];
        });
        
        // Load Ramadan info
        const ramadanResponse = await fetch('/api/ramadan');
        const ramadanData = await ramadanResponse.json();
        
        document.getElementById('ramadan-start').textContent = ramadanData.start;
        document.getElementById('ramadan-end').textContent = ramadanData.end;
        
        if (ramadanData.status === 'upcoming') {
            document.getElementById('ramadan-fill').style.width = '0%';
        } else if (ramadanData.status === 'current') {
            const percentage = (ramadanData.day / ramadanData.total_days) * 100;
            document.getElementById('ramadan-fill').style.width = percentage + '%';
            document.getElementById('ramadan-fill').textContent = `Day ${ramadanData.day}/${ramadanData.total_days}`;
            document.getElementById('ramadan-status').textContent = `🌙 Ramadan Day ${ramadanData.day} of ${ramadanData.total_days}`;
        } else {
            document.getElementById('ramadan-status').textContent = 'Ramadan has ended.';
            document.getElementById('ramadan-fill').style.width = '100%';
        }
        
        // Start countdown updates
        updateCountdowns();
        setInterval(updateCountdowns, 1000);
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function getNextPrayer() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (let prayer of prayers) {
        const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
        const prayerTotalSeconds = hours * 3600 + minutes * 60;
        
        if (prayerTotalSeconds > currentTotalSeconds) {
            return { name: prayer, totalSeconds: prayerTotalSeconds };
        }
    }
    
    // Next prayer is tomorrow's Fajr
    const [hours, minutes] = prayerTimes['Fajr'].split(':').map(Number);
    const tomorrowSeconds = hours * 3600 + minutes * 60;
    const secondsUntilMidnight = (24 * 3600) - currentTotalSeconds;
    return { name: 'Fajr (Tomorrow)', totalSeconds: tomorrowSeconds, isTomorrow: true, secondsUntilMidnight };
}

function updateCountdowns() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const nextPrayer = getNextPrayer();
    
    prayers.forEach(prayer => {
        const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
        const prayerTotalSeconds = hours * 3600 + minutes * 60;
        const secondsLeft = prayerTotalSeconds - currentTotalSeconds;
        
        const card = document.querySelector(`[data-prayer="${prayer}"]`);
        
        if (secondsLeft > 0) {
            const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
            const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
            const s = String(secondsLeft % 60).padStart(2, '0');
            document.getElementById(`countdown-${prayer}`).textContent = `${h}:${m}:${s}`;
            
            if (prayer === nextPrayer.name) {
                card.classList.add('active-prayer');
            } else {
                card.classList.remove('active-prayer');
            }
        } else {
            document.getElementById(`countdown-${prayer}`).textContent = '--:--:--';
            card.classList.remove('active-prayer');
        }
    });
    
    // Update next prayer status
    if (nextPrayer.isTomorrow) {
        const secondsLeft = nextPrayer.secondsUntilMidnight + nextPrayer.totalSeconds;
        const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
        const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
        const s = String(secondsLeft % 60).padStart(2, '0');
        document.getElementById('next-prayer-status').textContent = `Next Prayer: ${nextPrayer.name} - ${h}:${m}:${s}`;
    } else {
        const secondsLeft = nextPrayer.totalSeconds - currentTotalSeconds;
        const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
        const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
        const s = String(secondsLeft % 60).padStart(2, '0');
        document.getElementById('next-prayer-status').textContent = `Next Prayer: ${nextPrayer.name} - ${h}:${m}:${s}`;
    }
    
    // Update last updated time
    const timeStr = now.toLocaleTimeString();
    document.getElementById('last-updated').textContent = timeStr;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadData);
