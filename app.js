// 메인 애플리케이션 로직
document.addEventListener('DOMContentLoaded', function() {
  // 앱 컨테이너 생성
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <h1>영유아 성장 계산기 (0-36개월)</h1>
      
      <div class="grid">
        <div class="card">
          <h2>기본 정보 입력</h2>
          
          <div class="mb-4">
            <label>성별</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="gender" value="male" checked>
                남아
              </label>
              <label class="radio-label">
                <input type="radio" name="gender" value="female">
                여아
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label>데이터 소스</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="dataSource" value="korean" checked>
                한국 소아청소년성장도표
              </label>
              <label class="radio-label">
                <input type="radio" name="dataSource" value="who">
                WHO
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label>생년월일</label>
            <input type="date" id="birthDate">
          </div>
          
          <div class="mb-4">
            <label>측정일자</label>
            <input type="date" id="measurementDate">
          </div>
          
          <div id="ageDisplay" class="info-box" style="display: none;">
            측정 당시 월령: <strong id="ageValue"></strong>개월
          </div>
        </div>
        
        <div class="card">
          <h2>측정값 입력</h2>
          
          <div class="mb-4">
            <label>측정 항목</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="measurementType" value="height" checked>
                키
              </label>
              <label class="radio-label">
                <input type="radio" name="measurementType" value="weight">
                몸무게
              </label>
              <label class="radio-label">
                <input type="radio" name="measurementType" value="headCircumference">
                머리둘레
              </label>
            </div>
          </div>
          
          <div id="heightInput" class="mb-4">
            <label>키 (cm)</label>
            <input type="number" step="0.1" id="height" placeholder="예: 70.5">
          </div>
          
          <div id="weightInput" class="mb-4" style="display: none;">
            <label>몸무게 (kg)</label>
            <input type="number" step="0.1" id="weight" placeholder="예: 8.5">
          </div>
          
          <div id="headCircumferenceInput" class="mb-4" style="display: none;">
            <label>머리둘레 (cm)</label>
            <input type="number" step="0.1" id="headCircumference" placeholder="예: 44.5">
          </div>
          
          <div id="resultBox" class="result-box" style="display: none;">
            <h3>분석 결과</h3>
            <p>백분위: <strong id="percentileValue"></strong>%</p>
            <p>상태: <strong id="statusValue"></strong></p>
            <p style="font-size: 12px; margin-top: 12px;">
              백분위는 같은 월령, 같은 성별의 아이들 중 아이의 측정값이 상위 몇 퍼센트에 해당하는지를 나타냅니다.
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>성장 도표</h2>
        <div id="chartContainer" class="chart-container">
          <div id="emptyChart" class="empty-chart">
            아이의 기본 정보와 측정값을 입력해주세요.
          </div>
          <canvas id="growthChart" style="display: none;"></canvas>
        </div>
      </div>
      
      <div class="footer">
        이 계산기는 참고용으로만 사용하세요. 아이의 건강 상태에 대한 전문적인 조언은 소아과 의사에게 문의하세요.
      </div>
      
      <div class="ad-container">
        광고 영역
      </div>
    </div>
  `;

  // 변수 및 엘리먼트 선언
  let chart = null;
  let ageInMonths = 0;
  let gender = 'male';
  let dataSource = 'korean';
  let measurementType = 'height';
  let percentile = null;
  let status = '';

  // 엘리먼트 참조
  const birthDateInput = document.getElementById('birthDate');
  const measurementDateInput = document.getElementById('measurementDate');
  const ageDisplay = document.getElementById('ageDisplay');
  const ageValue = document.getElementById('ageValue');
  const heightInput = document.getElementById('heightInput');
  const weightInput = document.getElementById('weightInput');
  const headCircumferenceInput = document.getElementById('headCircumferenceInput');
  const heightValue = document.getElementById('height');
  const weightValue = document.getElementById('weight');
  const headCircumferenceValue = document.getElementById('headCircumference');
  const resultBox = document.getElementById('resultBox');
  const percentileValue = document.getElementById('percentileValue');
  const statusValue = document.getElementById('statusValue');
  const emptyChart = document.getElementById('emptyChart');
  const growthChart = document.getElementById('growthChart');
  
  // 성별 선택 이벤트
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  genderInputs.forEach(input => {
    input.addEventListener('change', function() {
      gender = this.value;
      updateResults();
    });
  });
  
  // 데이터 소스 선택 이벤트
  const dataSourceInputs = document.querySelectorAll('input[name="dataSource"]');
  dataSourceInputs.forEach(input => {
    input.addEventListener('change', function() {
      dataSource = this.value;
      updateResults();
    });
  });
  
  // 측정 타입 선택 이벤트
  const measurementTypeInputs = document.querySelectorAll('input[name="measurementType"]');
  measurementTypeInputs.forEach(input => {
    input.addEventListener('change', function() {
      measurementType = this.value;
               
      // 입력 필드 표시/숨김
      heightInput.style.display = measurementType === 'height' ? 'block' : 'none';
      weightInput.style.display = measurementType === 'weight' ? 'block' : 'none';
      headCircumferenceInput.style.display = measurementType === 'headCircumference' ? 'block' : 'none';
      
      updateResults();
    });
  });
  
  // 날짜 입력 이벤트
  birthDateInput.addEventListener('change', calculateAge);
  measurementDateInput.addEventListener('change', calculateAge);
  
  // 측정값 입력 이벤트
  heightValue.addEventListener('input', updateResults);
  weightValue.addEventListener('input', updateResults);
  headCircumferenceValue.addEventListener('input', updateResults);
  
  // 나이 계산 함수
  function calculateAge() {
    if (birthDateInput.value && measurementDateInput.value) {
      const birth = new Date(birthDateInput.value);
      const measurement = new Date(measurementDateInput.value);
      
      if (measurement < birth) {
        alert('측정일자는 생년월일보다 이후여야 합니다.');
        return;
      }
      
      const diffTime = Math.abs(measurement - birth);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      ageInMonths = Math.floor(diffDays / 30.44); // 평균 한 달 일수로 계산
      
      ageValue.textContent = ageInMonths;
      ageDisplay.style.display = 'block';
      
      updateResults();
    }
  }
  
  // 결과 업데이트 함수
  function updateResults() {
    if (ageInMonths === 0) return;
    
    let measurementValue;
    if (measurementType === 'height' && heightValue.value) {
      measurementValue = parseFloat(heightValue.value);
    } else if (measurementType === 'weight' && weightValue.value) {
      measurementValue = parseFloat(weightValue.value);
    } else if (measurementType === 'headCircumference' && headCircumferenceValue.value) {
      measurementValue = parseFloat(headCircumferenceValue.value);
    } else {
      resultBox.style.display = 'none';
      emptyChart.style.display = 'flex';
      growthChart.style.display = 'none';
      if (chart) {
        chart.destroy();
        chart = null;
      }
      return;
    }
    
    // 데이터세트 선택
    const dataSet = dataSource === 'korean' ? koreanData : whoData;
    const genderData = dataSet[gender];
    const measurementData = genderData[measurementType];
    
    // 가장 가까운 월령 인덱스 찾기
    const monthsArray = measurementData.months;
    let closestMonthIndex = 0;
    let minDiff = Math.abs(monthsArray[0] - ageInMonths);

    for (let i = 1; i < monthsArray.length; i++) {
      const diff = Math.abs(monthsArray[i] - ageInMonths);
      if (diff < minDiff) {
        minDiff = diff;
        closestMonthIndex = i;
      }
    }
    
    // 백분위 계산
    const percentiles = measurementData.percentiles;
    let calculatedPercentile = 0;

    if (measurementValue < percentiles.p3[closestMonthIndex]) {
      calculatedPercentile = 1;
      status = '미달';
    } else if (measurementValue < percentiles.p10[closestMonthIndex]) {
      calculatedPercentile = 3 + (measurementValue - percentiles.p3[closestMonthIndex]) / 
        (percentiles.p10[closestMonthIndex] - percentiles.p3[closestMonthIndex]) * 7;
      status = '표준 이하';
    } else if (measurementValue < percentiles.p25[closestMonthIndex]) {
      calculatedPercentile = 10 + (measurementValue - percentiles.p10[closestMonthIndex]) / 
        (percentiles.p25[closestMonthIndex] - percentiles.p10[closestMonthIndex]) * 15;
      status = '표준';
    } else if (measurementValue < percentiles.p50[closestMonthIndex]) {
      calculatedPercentile = 25 + (measurementValue - percentiles.p25[closestMonthIndex]) / 
        (percentiles.p50[closestMonthIndex] - percentiles.p25[closestMonthIndex]) * 25;
      status = '표준';
    } else if (measurementValue < percentiles.p75[closestMonthIndex]) {
      calculatedPercentile = 50 + (measurementValue - percentiles.p50[closestMonthIndex]) / 
        (percentiles.p75[closestMonthIndex] - percentiles.p50[closestMonthIndex]) * 25;
      status = '표준';
    } else if (measurementValue < percentiles.p90[closestMonthIndex]) {
      calculatedPercentile = 75 + (measurementValue - percentiles.p75[closestMonthIndex]) / 
        (percentiles.p90[closestMonthIndex] - percentiles.p75[closestMonthIndex]) * 15;
      status = '표준';
    } else if (measurementValue < percentiles.p97[closestMonthIndex]) {
      calculatedPercentile = 90 + (measurementValue - percentiles.p90[closestMonthIndex]) / 
        (percentiles.p97[closestMonthIndex] - percentiles.p90[closestMonthIndex]) * 7;
      status = '표준 이상';
    } else {
      calculatedPercentile = 99;
      status = '초과';
    }
    
    percentile = Math.round(calculatedPercentile);
    percentileValue.textContent = percentile;
    statusValue.textContent = status;
    resultBox.style.display = 'block';
    
    // 차트 업데이트
    updateChart(measurementValue);
  }
  
  // 차트 업데이트 함수
  function updateChart(measurementValue) {
    // 데이터세트 선택
    const dataSet = dataSource === 'korean' ? koreanData : whoData;
    const genderData = dataSet[gender];
    const measurementData = genderData[measurementType];
    const monthsArray = measurementData.months;
    const percentiles = measurementData.percentiles;
    
    // 차트 데이터 준비
    const chartData = {
      labels: monthsArray,
      datasets: [
        {
          label: '3%',
          data: percentiles.p3,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '10%',
          data: percentiles.p10,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '25%',
          data: percentiles.p25,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '50%',
          data: percentiles.p50,
          borderColor: 'rgba(0, 156, 180, 1)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '75%',
          data: percentiles.p75,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '90%',
          data: percentiles.p90,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: '97%',
          data: percentiles.p97,
          borderColor: 'rgba(0, 156, 180, 0.7)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
    
    // 사용자 측정값 추가
    // 전체 배열에 null을 채우고 해당 월령에만 값을 넣음
    const userDataset = Array(monthsArray.length).fill(null);
    
    // 가장 가까운 인덱스 찾기
    let closestIndex = 0;
    let minDiff = Math.abs(monthsArray[0] - ageInMonths);
    
    for (let i = 1; i < monthsArray.length; i++) {
      const diff = Math.abs(monthsArray[i] - ageInMonths);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    
    userDataset[closestIndex] = measurementValue;
    
    chartData.datasets.push({
      label: '내 아이',
      data: userDataset,
      backgroundColor: 'red',
      borderColor: 'red',
      pointRadius: 6,
      pointHoverRadius: 8
    });
    
    // 차트 옵션
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: '월령 (개월)'
          }
        },
        y: {
          title: {
            display: true,
            text: measurementType === 'height' ? '키 (cm)' : 
                  measurementType === 'weight' ? '몸무게 (kg)' : '머리둘레 (cm)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `${gender === 'male' ? '남아' : '여아'} ${
            measurementType === 'height' ? '키' : 
            measurementType === 'weight' ? '몸무게' : '머리둘레'
          } 성장도표 (0-36개월)`
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    };
    
    // 기존 차트 삭제
    if (chart) {
      chart.destroy();
    }
    
    // 새 차트 생성
    emptyChart.style.display = 'none';
    growthChart.style.display = 'block';
    chart = new Chart(growthChart.getContext('2d'), {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }
});
