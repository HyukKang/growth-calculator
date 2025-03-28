```javascript
// 간략화된 한국 소아청소년 성장도표 데이터 (예시)
const koreanData = {
  male: {
    height: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [47.5, 52.2, 55.8, 58.6, 64.4, 68.6, 71.7, 76.0, 80.2, 83.6, 86.5],
        p10: [49.1, 53.8, 57.4, 60.3, 66.2, 70.4, 73.5, 77.8, 82.1, 85.5, 88.4],
        p25: [50.7, 55.4, 59.0, 61.9, 67.8, 72.1, 75.2, 79.6, 83.9, 87.4, 90.3],
        p50: [52.5, 57.2, 60.9, 63.8, 69.8, 74.1, 77.2, 81.7, 86.0, 89.5, 92.5],
        p75: [54.3, 59.0, 62.7, 65.7, 71.7, 76.1, 79.3, 83.8, 88.1, 91.7, 94.7],
        p90: [56.0, 60.7, 64.4, 67.4, 73.5, 78.0, 81.2, 85.7, 90.1, 93.7, 96.7],
        p97: [57.6, 62.4, 66.1, 69.1, 75.3, 79.8, 83.0, 87.6, 92.0, 95.6, 98.7]
      }
    },
    weight: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [2.6, 3.6, 4.5, 5.2, 6.4, 7.2, 7.8, 8.8, 9.7, 10.5, 11.2],
        p10: [2.9, 3.9, 4.9, 5.6, 6.9, 7.8, 8.4, 9.5, 10.4, 11.2, 12.0],
        p25: [3.2, 4.3, 5.3, 6.0, 7.4, 8.3, 9.0, 10.1, 11.1, 12.0, 12.8],
        p50: [3.5, 4.7, 5.8, 6.6, 8.0, 9.0, 9.6, 10.9, 11.9, 12.8, 13.7],
        p75: [3.9, 5.1, 6.2, 7.1, 8.6, 9.7, 10.4, 11.7, 12.8, 13.7, 14.6],
        p90: [4.3, 5.5, 6.7, 7.6, 9.2, 10.3, 11.1, 12.5, 13.6, 14.6, 15.6],
        p97: [4.6, 5.9, 7.2, 8.1, 9.8, 11.0, 11.8, 13.3, 14.5, 15.5, 16.5]
      }
    },
    headCircumference: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [32.1, 35.2, 37.0, 38.3, 41.0, 42.5, 43.5, 44.8, 45.8, 46.4, 46.9],
        p10: [33.0, 36.0, 37.7, 39.0, 41.7, 43.1, 44.1, 45.3, 46.3, 46.9, 47.4],
        p25: [33.7, 36.7, 38.5, 39.8, 42.5, 43.9, 44.9, 46.1, 47.0, 47.7, 48.2],
        p50: [34.5, 37.5, 39.2, 40.5, 43.3, 44.7, 45.8, 47.0, 47.9, 48.6, 49.1],
        p75: [35.3, 38.3, 40.0, 41.3, 44.1, 45.5, 46.6, 47.8, 48.8, 49.5, 50.0],
        p90: [36.1, 39.0, 40.7, 42.0, 44.8, 46.3, 47.4, 48.6, 49.6, 50.3, 50.8],
        p97: [36.9, 39.8, 41.5, 42.8, 45.6, 47.1, 48.2, 49.4, 50.4, 51.1, 51.7]
      }
    }
  },
  female: {
    height: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [46.8, 51.1, 54.6, 57.4, 63.2, 67.2, 70.5, 75.0, 79.2, 82.6, 85.7],
        p10: [48.4, 52.7, 56.2, 59.0, 64.9, 68.9, 72.2, 76.8, 81.0, 84.5, 87.6],
        p25: [49.9, 54.3, 57.8, 60.6, 66.5, 70.6, 73.9, 78.6, 82.9, 86.3, 89.5],
        p50: [51.7, 56.0, 59.6, 62.4, 68.4, 72.5, 75.9, 80.6, 84.9, 88.4, 91.6],
        p75: [53.4, 57.8, 61.3, 64.2, 70.3, 74.4, 77.8, 82.6, 87.0, 90.5, 93.8],
        p90: [55.0, 59.4, 63.0, 65.9, 72.0, 76.2, 79.6, 84.5, 88.9, 92.4, 95.7],
        p97: [56.6, 61.0, 64.6, 67.5, 73.7, 77.9, 81.4, 86.3, 90.7, 94.3, 97.6]
      }
    },
    weight: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [2.4, 3.3, 4.1, 4.7, 5.9, 6.6, 7.2, 8.2, 9.0, 9.9, 10.5],
        p10: [2.7, 3.6, 4.5, 5.1, 6.3, 7.1, 7.7, 8.8, 9.7, 10.5, 11.3],
        p25: [3.0, 4.0, 4.9, 5.5, 6.8, 7.6, 8.2, 9.4, 10.3, 11.2, 12.0],
        p50: [3.3, 4.3, 5.3, 6.0, 7.3, 8.2, 8.9, 10.1, 11.0, 12.0, 12.9],
        p75: [3.6, 4.7, 5.7, 6.5, 7.9, 8.8, 9.5, 10.8, 11.8, 12.8, 13.8],
        p90: [4.0, 5.1, 6.2, 7.0, 8.5, 9.5, 10.2, 11.6, 12.7, 13.7, 14.8],
        p97: [4.3, 5.5, 6.6, 7.4, 9.0, 10.0, 10.8, 12.3, 13.5, 14.6, 15.7]
      }
    },
    headCircumference: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [31.7, 34.6, 36.2, 37.4, 40.0, 41.5, 42.5, 44.0, 44.9, 45.5, 46.1],
        p10: [32.4, 35.3, 36.9, 38.1, 40.7, 42.2, 43.2, 44.7, 45.7, 46.3, 46.8],
        p25: [33.0, 36.0, 37.6, 38.8, 41.4, 42.8, 43.9, 45.4, 46.4, 46.9, 47.5],
        p50: [33.9, 36.8, 38.4, 39.7, 42.2, 43.7, 44.7, 46.2, 47.2, 47.8, 48.3],
        p75: [34.7, 37.6, 39.2, 40.5, 43.1, 44.5, 45.6, 47.0, 48.0, 48.7, 49.2],
        p90: [35.5, 38.3, 40.0, 41.3, 43.8, 45.3, 46.3, 47.8, 48.8, 49.4, 50.0],
        p97: [36.2, 39.1, 40.8, 42.1, 44.6, 46.0, 47.1, 48.5, 49.5, 50.2, 50.7]
      }
    }
  }
};

// WHO 데이터 (실제 구현시 전체 데이터로 대체)
const whoData = {
  male: {
    // WHO 남아 데이터 (예시)
    height: {
      months: [0, 1, 2, 3, 6, 9, 12, 18, 24, 30, 36],
      percentiles: {
        p3: [46.3, 51.1, 54.7, 57.6, 63.8, 67.7, 70.8, 75.3, 79.6, 83.1, 86.1],
        p10: [48.0, 52.8, 56.4, 59.3, 65.5, 69.5, 72.6, 77.1, 81.5, 85.0, 88.0],
        p25: [49.5, 54.4, 58.0, 61.0, 67.2, 71.2, 74.3, 78.9, 83.4, 86.9, 89.9],
        p50: [51.1, 56.0, 59.7, 62.7, 69.0, 73.0, 76.1, 80.7, 85.3, 88.8, 91.9],
        p75: [52.7, 57.6, 61.3, 64.4, 70.7, 74.7, 77.9, 82.6, 87.2, 90.7, 93.8],
        p90: [54.2, 59.1, 62.8, 65.9, 72.3, 76.3, 79.5, 84.3, 88.9, 92.5, 95.6],
        p97: [55.6, 60.5, 64.3, 67.4, 73.9, 77.9, 81.2, 86.0, 90.6, 94.2, 97.4]
      }
    },
    weight: {
      // WHO 남아 몸무게 데이터
    },
    headCircumference: {
      // WHO 남아 머리둘레 데이터
    }
  },
  female: {
    // WHO 여아 데이터
  }
};
```
