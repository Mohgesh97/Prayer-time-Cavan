from flask import Flask, render_template, jsonify
import requests
from datetime import datetime, date
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

CAVAN_LAT = 54.0053
CAVAN_LON = -7.365

def get_prayer_times():
    try:
        today = datetime.now()
        day = today.strftime('%d')
        month = today.strftime('%m')
        year = today.strftime('%Y')
        date_str = f"{day}-{month}-{year}"
        
        url = 'https://api.aladhan.com/v1/timings'
        params = {
            'latitude': CAVAN_LAT,
            'longitude': CAVAN_LON,
            'method': 2,
            'date': date_str
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        timings = data['data']['timings']
        
        return {
            'status': 'success',
            'date': today.strftime('%A, %B %d, %Y'),
            'prayers': {
                'Fajr': timings['Fajr'],
                'Dhuhr': timings['Dhuhr'],
                'Asr': timings['Asr'],
                'Maghrib': timings['Maghrib'],
                'Isha': timings['Isha']
            }
        }
    except Exception as e:
        return {
            'status': 'error',
            'date': datetime.now().strftime('%A, %B %d, %Y'),
            'prayers': {
                'Fajr': '06:05',
                'Dhuhr': '12:43',
                'Asr': '15:10',
                'Maghrib': '17:45',
                'Isha': '19:23'
            }
        }

def get_ramadan_2026():
    ramadan_start = date(2026, 2, 18)
    ramadan_end = date(2026, 4, 19)
    today = date.today()
    
    days_passed = (today - ramadan_start).days if today >= ramadan_start else 0
    days_total = (ramadan_end - ramadan_start).days + 1
    
    return {
        'start': 'Today - Feb 18, 2026',
        'end': 'Apr 19, 2026',
        'day': max(1, days_passed + 1) if today >= ramadan_start and today <= ramadan_end else (1 if today < ramadan_start else 30),
        'total_days': 30,
        'status': 'current'
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/prayer-times')
def prayer_times():
    return jsonify(get_prayer_times())

@app.route('/api/ramadan')
def ramadan():
    return jsonify(get_ramadan_2026())

if __name__ == '__main__':
    app.run(debug=False)
if __name__ == '__main__':
    app.run(debug=False, port=5000)
