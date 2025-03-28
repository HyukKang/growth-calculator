
document.addEventListener('DOMContentLoaded', function() {
    // URL 파라미터 파싱
    const urlParams = new URLSearchParams(window.location.search);
    const gender = urlParams.get('gender');
    const birthDate = urlParams.get('birthDate');
    const height = parseFloat(urlParams.get('height'));
    const weight = parseFloat(urlParams.get('weight'));
    const headCircumference = urlParams.get('headCircumference') ? parseFloat(urlParams.get('headCircumference')) : null;
    const dataSource = urlParams.get('dataSource');
    
    // 아이 정보 표시
    document.getElementById('childGender').textContent = gender === 'male' ? '남자' : '여자';
    document.getElementById('childBirthDate').textContent = formatDate(birthDate);
    document.getElementById('dataStandard').textContent = dataSource === 'kdca' ? '질병관리청 기준' : 'WHO 기준';
    document.getElementById('heightValue').textContent = `${height} cm`;
    document.getElementById('weightValue').textContent = `${weight} kg`;
    
    // 나이 계산 및 표시
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const ageInMonths = calculateAgeInMonths(birthDateObj, today);
    const ageInDays = calculateAgeInDays(birthDateObj, today);
    
    if (ageInMonths < 1) {
        document.getElementById('childAge').textContent = `${ageInDays}일`;
    } else {
        document.getElementById('childAge').textContent = `${ageInMonths}개월 (${ageInDays}일)`;
    }
    
    // 측정값 표시
    document.getElementById('heightValueDetail').textContent = `${height} cm`;
    document.getElementById('weightValueDetail').textContent = `${weight} kg`;
    if (headCircumference) {
        document.getElementById('headValueDetail').textContent = `${headCircumference} cm`;
    } else {
        document.getElementById('headValueDetail').textContent = '미측정';
        document.getElementById('headPercentile').textContent = '-';
        document.getElementById('headStatus').textContent = '측정 안됨';
        document.getElementById('headStatus').className = '';
        document.getElementById('head-tab').classList.add('disabled');
    }
    
    // BMI 계산 (2세 이상일 경우)
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiFormatted = bmi.toFixed(1);
    
    document.getElementById('bmiValue').textContent = `BMI: ${bmiFormatted}`;
    
    if (ageInMonths < 24) {
        document.getElementById('bmiCard').style.display = 'none';
        document.getElementById('bmi-tab').style.display = 'none';
    } else {
        document.getElementById('bmiCard').style.display = 'block';
        document.getElementById('bmi-tab').style.display = 'block';
    }
    
    // 데이터 선택
    const sourceData = dataSource === 'kdca' ? koreanData : whoData;
    const genderData = sourceData[gender];
    
    // 백분위수 계산
    const heightPercentile = calculatePercentile(height, genderData.height, ageInMonths);
    const weightPercentile = calculatePercentile(weight, genderData.weight, ageInMonths);
    let headPercentile = null;
    if (headCircumference) {
        headPercentile = calculatePercentile(headCircumference, genderData.headCircumference, ageInMonths);
    }
    let bmiPercentile = null;
    if (ageInMonths >= 24) {
        bmiPercentile = calculatePercentile(bmi, genderData.bmi, ageInMonths);
    }
    
    // 백분위수 표시
    document.getElementById('heightPercentile').textContent = heightPercentile;
    document.getElementById('weightPercentile').textContent = weightPercentile;
    if (headCircumference) {
        document.getElementById('headPercentile').textContent = headPercentile;
    }
    if (ageInMonths >= 24) {
        document.getElementById('bmiPercentile').textContent = bmiPercentile;
    }
    
    // 상태 표시
    updateStatus('heightStatus', heightPercentile);
    updateStatus('weightStatus', weightPercentile);
    if (headCircumference) {
        updateStatus('headStatus', headPercentile);
    }
    if (ageInMonths >= 24) {
        updateBMIStatus('bmiStatus', bmiPercentile);
    }
    
    // 차트 생성
    createGrowthChart('heightChartCanvas', genderData.height, ageInMonths, height, '신장 (cm)');
    createGrowthChart('weightChartCanvas', genderData.weight, ageInMonths, weight, '체중 (kg)');
    if (headCircumference) {
        createGrowthChart('headChartCanvas', genderData.headCircumference, ageInMonths, headCircumference, '머리둘레 (cm)');
    }
    if (ageInMonths >= 24) {
        createGrowthChart('bmiChartCanvas', genderData.bmi, ageInMonths, bmi, 'BMI');
    }
    
    // 해석 업데이트
    updateInterpretation('heightInterpretation', heightPercentile, 'height');
    updateInterpretation('weightInterpretation', weightPercentile, 'weight');
    if (headCircumference) {
        updateInterpretation('headInterpretation', headPercentile, 'head');
    }
    if (ageInMonths >= 24) {
        updateBMIInterpretation('bmiInterpretation', bmiPercentile);
        updateBMIInterpretation('bmiChartInterpretation', bmiPercentile);
    }
});

// 백분위수 계산 함수
function calculatePercentile(value, measurementData, ageInMonths) {
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
    
    // 백분위수 선별
    const percentiles = measurementData.percentiles;
    
    if (value < percentiles.p3[closestMonthIndex]) {
        return 3;
    } else if (value < percentiles.p10[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p3[closestMonthIndex], 3, 
            percentiles.p10[closestMonthIndex], 10);
    } else if (value < percentiles.p25[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p10[closestMonthIndex], 10, 
            percentiles.p25[closestMonthIndex], 25);
    } else if (value < percentiles.p50[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p25[closestMonthIndex], 25, 
            percentiles.p50[closestMonthIndex], 50);
    } else if (value < percentiles.p75[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p50[closestMonthIndex], 50, 
            percentiles.p75[closestMonthIndex], 75);
    } else if (value < percentiles.p90[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p75[closestMonthIndex], 75, 
            percentiles.p90[closestMonthIndex], 90);
    } else if (value < percentiles.p97[closestMonthIndex]) {
        return interpolatePercentile(value, 
            percentiles.p90[closestMonthIndex], 90, 
            percentiles.p97[closestMonthIndex], 97);
    } else {
        return 97;
    }
}

// 백분위수 선형 보간법
function interpolatePercentile(value, lowerValue, lowerPercentile, upperValue, upperPercentile) {
    const ratio = (value - lowerValue) / (upperValue - lowerValue);
    const percentile = lowerPercentile + ratio * (upperPercentile - lowerPercentile);
    return Math.round(percentile);
}

// 상태 업데이트 함수
function updateStatus(percentile) {
    let status = "";
    let description = "";

    if (percentile >= 90) {
        status = "양호 범위";
        description = "건강 상태가 양호하며 별도의 조치가 필요하지 않습니다.";
    } else if (percentile >= 50) {
        status = "안정적 상태";
        description = "전반적으로 안정적인 상태로, 주기적인 확인을 권장합니다.";
    } else {
        status = "건강 확인 필요";
        description = "건강 체크가 필요하며, 전문가의 상담을 고려하세요.";
    }

    return { status, description };
}


// BMI 상태 업데이트 함수
function updateBMIStatus(elementId, percentile) {
    const element = document.getElementById(elementId);
    element.classList.remove('status-normal', 'status-warning', 'status-alert');
    
    if (percentile < 5) {
        element.textContent = '저체중';
        element.classList.add('status-warning');
    } else if (percentile >= 95) {
        element.textContent = '비만';
        element.classList.add('status-alert');
    } else if (percentile >= 85) {
        element.textContent = '과체중';
        element.classList.add('status-warning');
    } else {
        element.textContent = '정상 체중';
        element.classList.add('status-normal');
    }
}

// 해석 업데이트 함수
function updateInterpretation(elementId, percentile, type) {
    const element = document.getElementById(elementId);
    let message = '';
    
    if (percentile < 3) {
        if (type === 'height') {
            message = '아이의 신장은 또래 아이들과 비교하여 낮은 편입니다. 지속적인 성장 모니터링과 소아과 의사와의 상담을 권장합니다.';
        } else if (type === 'weight') {
            message = '아이의 체중은 또래 아이들과 비교하여 낮은 편입니다. 균형 잡힌 영양 섭취가 중요하며, 소아과 의사와 상담하시는 것이 좋습니다.';
        } else if (type === 'head') {
            message = '아이의 머리둘레는 또래 아이들과 비교하여 작은 편입니다. 성장 과정에서 변화가 있을 수 있으므로 정기적인 측정과 관찰이 중요합니다.';
        }
    } else if (percentile > 97) {
        if (type === 'height') {
            message = '아이의 신장은 또래 아이들과 비교하여 높은 편입니다. 건강한 성장의 범위 내에 있지만, 정기적인 성장 모니터링을 유지하세요.';
        } else if (type === 'weight') {
            message = '아이의 체중은 또래 아이들과 비교하여 높은 편입니다. 균형 잡힌 식단과 적절한 신체 활동이 중요합니다.';
        } else if (type === 'head') {
            message = '아이의 머리둘레는 또래 아이들과 비교하여 큰 편입니다. 정기적인 측정과 소아과 의사와의 상담을 권장합니다.';
        }
    } else {
        if (type === 'height') {
            message = '아이의 신장은 또래 아이들과 비교하여 정상 범위 내에 있습니다. 꾸준한 성장을 유지하고 있으며, 균형 잡힌 영양 섭취와 적절한 운동은 건강한 신장 발달에 중요합니다.';
        } else if (type === 'weight') {
            message = '아이의 체중은 또래 아이들과 비교하여 정상 범위 내에 있습니다. 균형 잡힌 식습관을 유지하는 것이 건강한 체중 관리의 핵심입니다.';
        } else if (type === 'head') {
            message = '아이의 머리둘레는 또래 아이들과 비교하여 정상 범위 내에 있습니다. 머리둘레는 뇌 발달과 관련이 있으며, 특히 만 3세 이하 영유아에서 중요한 성장 지표입니다.';
        }
    }
    
    element.innerHTML = message;
}

// BMI 해석 업데이트 함수
function updateBMIInterpretation(elementId, percentile) {
    const element = document.getElementById(elementId);
    let message = 'BMI(체질량지수)는 체중(kg)을 신장(m)의 제곱으로 나눈 값으로, 소아청소년의 체중상태를 평가하는 데 사용됩니다.';
    
    if (percentile < 5) {
        message += ' 아이의 BMI는 5백분위수 미만으로 저체중에 해당합니다. 균형 잡힌 영양 섭취가 중요하며, 소아과 의사와 상담하는 것이 좋습니다.';
    } else if (percentile >= 95) {
        message += ' 아이의 BMI는 95백분위수 이상으로 비만에 해당합니다. 건강한 식습관과 규칙적인 신체 활동이 중요하며, 소아과 의사와 상담하는 것을 권장합니다.';
    } else if (percentile >= 85) {
        message += ' 아이의 BMI는 85백분위수 이상으로 과체중에 해당합니다. 건강한 식습관과 적절한 신체 활동을 통해 건강한 체중 관리가 필요합니다.';
    } else {
        message += ' 아이의 BMI는 정상 범위 내에 있습니다. 건강한 식습관과 규칙적인 신체 활동을 통해 계속 유지하는 것이 좋습니다.';
    }
    
    element.innerHTML = message;
}

// 성장 차트 생성 함수
function createGrowthChart(canvasId, measurementData, ageInMonths, currentValue, unitLabel) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // 백분위수 선 데이터
    const monthsArray = measurementData.months;
    const percentiles = measurementData.percentiles;
    
    // 차트 제목 설정
    let chartTitle = '';
    if (unitLabel === '신장 (cm)') {
        chartTitle = '신장-나이 성장도표';
    } else if (unitLabel === '체중 (kg)') {
        chartTitle = '체중-나이 성장도표';
    } else if (unitLabel === '머리둘레 (cm)') {
        chartTitle = '머리둘레-나이 성장도표';
    } else if (unitLabel === 'BMI') {
        chartTitle = 'BMI-나이 성장도표';
    }
    
    // 현재 아이의 위치를 표시하기 위한 데이터
    const childData = Array(monthsArray.length).fill(null);
    
    // 가장 가까운 월령 인덱스 찾기
    let closestMonthIndex = 0;
    let minDiff = Math.abs(monthsArray[0] - ageInMonths);
    
    for (let i = 1; i < monthsArray.length; i++) {
        const diff = Math.abs(monthsArray[i] - ageInMonths);
        if (diff < minDiff) {
            minDiff = diff;
            closestMonthIndex = i;
        }
    }
    
    childData[closestMonthIndex] = currentValue;
    
    // 그래프의 컬러 설정
    const genderColor = document.getElementById('childGender').textContent === '남자' 
        ? 'rgba(83, 144, 217, 0.7)' 
        : 'rgba(232, 113, 155, 0.7)';
    const genderLightColor = document.getElementById('childGender').textContent === '남자' 
        ? 'rgba(83, 144, 217, 0.3)' 
        : 'rgba(232, 113, 155, 0.3)';
    
    // 차트 생성
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsArray.map(month => `${month}개월`),
            datasets: [
                {
                    label: '3%',
                    data: percentiles.p3,
                    borderColor: genderLightColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5]
                },
                {
                    label: '10%',
                    data: percentiles.p10,
                    borderColor: genderLightColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '25%',
                    data: percentiles.p25,
                    borderColor: genderColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '50%',
                    data: percentiles.p50,
                    borderColor: genderColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: '75%',
                    data: percentiles.p75,
                    borderColor: genderColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '90%',
                    data: percentiles.p90,
                    borderColor: genderLightColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '97%',
                    data: percentiles.p97,
                    borderColor: genderLightColor,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5]
                },
                {
                    label: '현재 위치',
                    data: childData,
                    borderColor: '#ff6b6b',
                    backgroundColor: '#ff6b6b',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#333',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    cornerRadius: 8,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} ${unitLabel}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '나이 (개월)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: unitLabel,
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// 나이 계산 함수 (개월)
function calculateAgeInMonths(birthDate, currentDate) {
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += currentDate.getMonth() - birthDate.getMonth();
    
    if (currentDate.getDate() < birthDate.getDate()) {
        months -= 1;
    }
    
    return months;
}

// 나이 계산 함수 (일)
function calculateAgeInDays(birthDate, currentDate) {
    const diffTime = Math.abs(currentDate - birthDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}
