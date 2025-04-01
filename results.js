// results.js - 차트 기능이 추가된 버전
document.addEventListener('DOMContentLoaded', function() {
    console.log("결과 페이지가 로드되었습니다");
    
    // URL 파라미터 가져오기
    const params = new URLSearchParams(window.location.search);
    const gender = params.get('gender');
    const birthDateStr = params.get('birthDate');
    const height = parseFloat(params.get('height'));
    const weight = parseFloat(params.get('weight'));
    const headCircumference = params.get('headCircumference') ? parseFloat(params.get('headCircumference')) : null;
    const dataSource = params.get('dataSource');
    
    if (!gender || !birthDateStr || isNaN(height) || isNaN(weight)) {
        console.error("필수 데이터가 누락되었습니다");
        return;
    }
    
    console.log("파라미터 파싱 완료:", gender, birthDateStr, height, weight, headCircumference, dataSource);
    
    // 기본 정보 표시
    document.getElementById('childGender').textContent = gender === 'male' ? '남자' : '여자';
    document.getElementById('childBirthDate').textContent = formatDate(birthDateStr);
    document.getElementById('heightValue').textContent = `${height} cm`;
    document.getElementById('weightValue').textContent = `${weight} kg`;
    document.getElementById('dataStandard').textContent = 'const dataset';    
    
    // 나이 계산
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    const ageMonths = calculateAgeInMonths(birthDate, today);
    const ageDays = calculateAgeInDays(birthDate, today);
    
    document.getElementById('childAge').textContent = `${ageMonths}개월 (${ageDays}일)`;
    console.log("나이 계산 완료:", ageMonths, ageDays);
    
    try {
        // 데이터셋 선택
        const dataset = data.kdca[gender];
        console.log("데이터셋 선택됨:", dataSource, gender);
        console.log("데이터셋 구조:", Object.keys(dataset));
        
        // 백분위 계산
        calculateAndDisplayPercentiles(dataset, height, weight, headCircumference, ageMonths);
        
        // 차트 그리기
        setTimeout(() => {
            drawCharts(dataset, height, weight, headCircumference, ageMonths);
        }, 500); // 약간의 지연을 두어 DOM이 완전히 준비되도록 함
        
    } catch (error) {
        console.error("백분위 계산 중 오류 발생:", error);
        alert("백분위 계산 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
});

// 백분위 계산 및 표시 함수
function calculateAndDisplayPercentiles(dataset, height, weight, headCircumference, ageMonths) {
    console.log("백분위 계산 시작");
    
    // 신장 백분위 계산
    if (dataset.height) {
        const heightPercentile = findPercentileRange(height, dataset.height, ageMonths);
        console.log("신장 백분위:", heightPercentile);
        document.getElementById('heightPercentile').textContent = heightPercentile;
        document.getElementById('heightValueDetail').textContent = `${height} cm`;
        updateStatus('heightStatus', heightPercentile);
        updateHeightInterpretation(heightPercentile);
    }
    
    // 체중 백분위 계산
    if (dataset.weight) {
        const weightPercentile = findPercentileRange(weight, dataset.weight, ageMonths);
        console.log("체중 백분위:", weightPercentile);
        document.getElementById('weightPercentile').textContent = weightPercentile;
        document.getElementById('weightValueDetail').textContent = `${weight} kg`;
        updateStatus('weightStatus', weightPercentile);
        updateWeightInterpretation(weightPercentile);
    }
    
    // 머리둘레 백분위 계산 (있는 경우만)
    if (headCircumference && dataset.headCircumference && ageMonths <= 72) {
        const headPercentile = findPercentileRange(headCircumference, dataset.headCircumference, Math.min(ageMonths, 72));
        console.log("머리둘레 백분위:", headPercentile);
        document.getElementById('headPercentile').textContent = headPercentile;
        document.getElementById('headValueDetail').textContent = `${headCircumference} cm`;
        updateStatus('headStatus', headPercentile);
        updateHeadInterpretation(headPercentile);
    } else {
        // 머리둘레 데이터가 없거나 너무 나이가 많은 경우
        const headCard = document.querySelector('.col-md-4:has(#headPercentile)');
        if (headCard) headCard.style.display = 'none';
        const headTab = document.getElementById('head-tab');
        if (headTab) headTab.style.display = 'none';
        const headChart = document.getElementById('head-chart');
        if (headChart) headChart.style.display = 'none';
    }
    
    // BMI 계산 (2세 이상)
    if (ageMonths >= 24) {
        const bmi = calculateBMI(height, weight);
        document.getElementById('bmiValue').textContent = `BMI: ${bmi.toFixed(1)}`;
        
        // BMI 백분위는 간단히 처리
        const bmiPercentile = estimateBMIPercentile(bmi, ageMonths);
        document.getElementById('bmiPercentile').textContent = bmiPercentile;
        updateStatus('bmiStatus', bmiPercentile);
        updateBMICategory(bmi, ageMonths);
    } else {
        // 2세 미만은 BMI 숨김
        const bmiCard = document.getElementById('bmiCard');
        if (bmiCard) bmiCard.style.display = 'none';
        const bmiTab = document.getElementById('bmi-tab');
        if (bmiTab) bmiTab.style.display = 'none';
        const bmiChart = document.getElementById('bmi-chart');
        if (bmiChart) bmiChart.style.display = 'none';
    }
}

// 차트 그리기 함수
function drawCharts(dataset, height, weight, headCircumference, ageMonths) {
    console.log("차트 그리기 시작");
    
    try {
        // 신장 차트
        if (dataset.height) {
            drawGrowthChart('heightChartCanvas', dataset.height, ageMonths, height, '신장 (cm)');
        }
        
        // 체중 차트
        if (dataset.weight) {
            drawGrowthChart('weightChartCanvas', dataset.weight, ageMonths, weight, '체중 (kg)');
        }
        
        // 머리둘레 차트 (3세 이하)
        if (headCircumference && dataset.headCircumference && ageMonths <= 36) {
            drawGrowthChart('headChartCanvas', dataset.headCircumference, ageMonths, headCircumference, '머리둘레 (cm)');
        }
        
        // BMI 차트 (2세 이상)
        if (ageMonths >= 24) {
            drawBMIChart('bmiChartCanvas', calculateBMI(height, weight));
        }
        
        console.log("모든 차트 그리기 완료");
    } catch (error) {
        console.error("차트 그리기 중 오류 발생:", error);
    }
}

// 성장 차트 그리기 함수
function drawGrowthChart(canvasId, dataCategory, ageMonths, currentValue, yAxisLabel) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`캔버스를 찾을 수 없음: ${canvasId}`);
        return;
    }
    
    console.log(`${canvasId} 차트 그리기 시작`);
    
    const ctx = canvas.getContext('2d');
    
    // 현재 나이를 중심으로 ±12개월 범위에 해당하는 데이터 준비
    const startMonth = Math.max(0, ageMonths - 12);
    const endMonth = Math.min(dataCategory.months.length - 1, ageMonths + 12);
    
    // 표시할 월령 데이터 범위
    const months = [];
    for (let i = startMonth; i <= endMonth; i++) {
        if (i < dataCategory.months.length) {
            months.push(dataCategory.months[i]);
        }
    }
    
    // 시각화를 위한 백분위선 데이터 준비
    const p3Data = months.map(month => {
        const idx = dataCategory.months.indexOf(month);
        return dataCategory.percentiles.p3[idx];
    });
    
    const p50Data = months.map(month => {
        const idx = dataCategory.months.indexOf(month);
        return dataCategory.percentiles.p50[idx];
    });
    
    const p97Data = months.map(month => {
        const idx = dataCategory.months.indexOf(month);
        return dataCategory.percentiles.p97[idx];
    });
    
    // 현재 값 데이터 포인트 준비
    const currentData = Array(months.length).fill(null);
    const currentMonthIndex = months.indexOf(ageMonths);
    if (currentMonthIndex !== -1) {
        currentData[currentMonthIndex] = currentValue;
    }
    
    // 차트 생성
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: '3백분위',
                    data: p3Data,
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '50백분위 (중간값)',
                    data: p50Data,
                    borderColor: 'rgba(54, 162, 235, 0.7)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '97백분위',
                    data: p97Data,
                    borderColor: 'rgba(255, 206, 86, 0.7)',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '현재 값',
                    data: currentData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 0,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '나이 (개월)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel
                    },
                    beginAtZero: false
                }
            }
        }
    });
    
    console.log(`${canvasId} 차트 그리기 완료`);
}

// BMI 차트 그리기 함수
function drawBMIChart(canvasId, currentBMI) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`캔버스를 찾을 수 없음: ${canvasId}`);
        return;
    }
    
    console.log(`${canvasId} BMI 차트 그리기 시작`);
    
    const ctx = canvas.getContext('2d');
    
    // BMI 카테고리별 설명 및 색상
    const categories = ['저체중', '정상', '과체중', '비만'];
    const colors = [
        'rgba(255, 206, 86, 0.7)',  // 노랑 (저체중)
        'rgba(54, 162, 235, 0.7)',  // 파랑 (정상)
        'rgba(255, 159, 64, 0.7)',  // 주황 (과체중)
        'rgba(255, 99, 132, 0.7)'   // 빨강 (비만)
    ];
    
    // BMI 카테고리 결정
    let currentCategory = 0;
    if (currentBMI >= 14 && currentBMI < 17) {
        currentCategory = 1; // 정상
    } else if (currentBMI >= 17 && currentBMI < 19) {
        currentCategory = 2; // 과체중
    } else if (currentBMI >= 19) {
        currentCategory = 3; // 비만
    }
    
    // 차트 데이터 준비
    const data = [5, 80, 10, 5]; // 각 카테고리의 너비 (백분위 기반)
    
    // 현재 BMI를 표시하기 위한 강조 색상
    const backgroundColors = [...colors];
    const borderColors = colors.map(color => color.replace('0.7', '1'));
    
    // 현재 카테고리 강조
    backgroundColors[currentCategory] = colors[currentCategory].replace('0.7', '0.9');
    
    // 차트 생성
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'BMI 카테고리',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `현재 BMI: ${currentBMI.toFixed(1)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '백분위 분포 (%)'
                    }
                }
            }
        }
    });
    
    console.log(`${canvasId} BMI 차트 그리기 완료`);
}

// 백분위 범위 찾기 함수
function findPercentileRange(value, dataCategory, ageMonths) {
    try {
        // 나이에 가장 가까운 월령 찾기
        const monthsArray = dataCategory.months;
        let closestIndex = 0;
        let minDifference = Math.abs(monthsArray[0] - ageMonths);
        
        for (let i = 1; i < monthsArray.length; i++) {
            const difference = Math.abs(monthsArray[i] - ageMonths);
            if (difference < minDifference) {
                minDifference = difference;
                closestIndex = i;
            }
        }
        
        console.log("가장 가까운 월령 인덱스:", closestIndex, "월령:", monthsArray[closestIndex]);
        
        // 백분위 값 추출
        const percentileValues = {};
        Object.keys(dataCategory.percentiles).forEach(percentile => {
            percentileValues[percentile] = dataCategory.percentiles[percentile][closestIndex];
        });
        
        console.log("백분위 값:", percentileValues);
        
        // 값을 기준으로 백분위 범위 찾기
        if (value < percentileValues.p3) return "< 3";
        if (value < percentileValues.p5) return "3-5";
        if (value < percentileValues.p10) return "5-10";
        if (value < percentileValues.p15) return "10-15";
        if (value < percentileValues.p25) return "15-25";
        if (value < percentileValues.p50) return "25-50";
        if (value < percentileValues.p75) return "50-75";
        if (value < percentileValues.p85) return "75-85";
        if (value < percentileValues.p90) return "85-90";
        if (value < percentileValues.p95) return "90-95";
        if (value < percentileValues.p97) return "95-97";
        if (value < percentileValues.p99) return "97-99";
        return "> 99";
    } catch (error) {
        console.error("백분위 범위 찾기 오류:", error);
        return "계산불가";
    }
}

// 상태 업데이트 함수
function updateStatus(elementId, percentileRange) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // 백분위 범위에서 중앙값 추정
    let midValue;
    if (percentileRange === "< 3") {
        midValue = 1.5;
    } else if (percentileRange === "> 99") {
        midValue = 99.5;
    } else {
        const [min, max] = percentileRange.split('-').map(Number);
        midValue = (min + max) / 2;
    }
    
    // 상태 설정
    if (midValue < 3) {
        element.textContent = "매우 낮음";
        element.className = "mt-2 fw-bold status-alert";
    } else if (midValue < 10) {
        element.textContent = "낮음";
        element.className = "mt-2 fw-bold status-warning";
    } else if (midValue > 97) {
        element.textContent = "매우 높음";
        element.className = "mt-2 fw-bold status-alert";
    } else if (midValue > 90) {
        element.textContent = "높음";
        element.className = "mt-2 fw-bold status-warning";
    } else {
        element.textContent = "정상 범위";
        element.className = "mt-2 fw-bold status-normal";
    }
}

// BMI 계산 함수
function calculateBMI(heightCm, weightKg) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

// BMI 백분위 추정 함수 (간단한 구현)
function estimateBMIPercentile(bmi, ageMonths) {
    // 여기서는 간단한 로직으로 처리
    if (bmi < 14) return "< 5";
    if (bmi < 15) return "5-15";
    if (bmi < 16) return "15-50";
    if (bmi < 17) return "50-85";
    if (bmi < 18) return "85-95";
    return "> 95";
}

// BMI 카테고리 업데이트
function updateBMICategory(bmi, ageMonths) {
    const element = document.getElementById('bmiInterpretation');
    const chartElement = document.getElementById('bmiChartInterpretation');
    if (!element) return;
    
    let category, description;
    
    if (bmi < 14) {
        category = "저체중";
        description = "BMI가 5백분위수 미만으로, <strong>저체중</strong>에 해당합니다. 균형 잡힌 영양 섭취가 필요할 수 있으며, 소아과 의사와 상담하는 것이 좋습니다.";
    } else if (bmi < 17) {
        category = "정상체중";
        description = "BMI가 5-85백분위수 사이로, <strong>정상체중</strong>에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 유지하는 것이 중요합니다.";
    } else if (bmi < 19) {
        category = "과체중";
        description = "BMI가 85-95백분위수 사이로, <strong>과체중</strong>에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 통해 건강한 체중 관리가 필요합니다.";
    } else {
        category = "비만";
        description = "BMI가 95백분위수 이상으로, <strong>비만</strong>에 해당합니다. 소아과 의사와 상담하여 건강한 체중 관리 방법을 알아보는 것이 좋습니다.";
    }
    
    element.innerHTML = description;
    if (chartElement) chartElement.innerHTML = description;
}

// 신장 해석 업데이트
function updateHeightInterpretation(percentileRange) {
    const element = document.getElementById('heightInterpretation');
    if (!element) return;
    
    // 백분위 범위에서 중앙값 추정
    let midValue;
    if (percentileRange === "< 3") {
        midValue = 1.5;
    } else if (percentileRange === "> 99") {
        midValue = 99.5;
    } else {
        const [min, max] = percentileRange.split('-').map(Number);
        midValue = (min + max) / 2;
    }
    
    if (midValue < 3) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>매우 낮은</strong> 수준입니다. 소아과 의사와 상담하여 성장 지연 가능성을 확인하는 것이 좋습니다. 균형 잡힌 영양 섭취와 충분한 수면이 중요합니다.";
    } else if (midValue < 10) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>낮은</strong> 수준입니다. 단, 개인차가 있으므로 지속적인 성장 추세를 확인하는 것이 중요합니다. 균형 잡힌 영양 섭취와 충분한 수면이 도움이 될 수 있습니다.";
    } else if (midValue > 97) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>매우 높은</strong> 수준입니다. 유전적인 영향이나 조기 성장 가능성이 있을 수 있습니다. 정기적인 성장 모니터링이 중요합니다.";
    } else if (midValue > 90) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>높은</strong> 수준입니다. 이는 정상적인 범위 내에 있으며, 유전적 요인이 영향을 미쳤을 수 있습니다.";
    } else {
        element.innerHTML = "아이의 신장은 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 꾸준한 성장을 유지하고 있으며, 균형 잡힌 영양 섭취와 적절한 운동은 건강한 신장 발달에 중요합니다.";
    }
}

// 체중 해석 업데이트
function updateWeightInterpretation(percentileRange) {
    const element = document.getElementById('weightInterpretation');
    if (!element) return;
    
    // 백분위 범위에서 중앙값 추정
    let midValue;
    if (percentileRange === "< 3") {
        midValue = 1.5;
    } else if (percentileRange === "> 99") {
        midValue = 99.5;
    } else {
        const [min, max] = percentileRange.split('-').map(Number);
        midValue = (min + max) / 2;
    }
    
    if (midValue < 3) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>매우 낮은</strong> 수준입니다. 소아과 의사와 상담하여 영양 상태를 확인하는 것이 좋습니다. 균형 잡힌 영양 섭취가 매우 중요합니다.";
    } else if (midValue < 10) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>낮은</strong> 수준입니다. 균형 잡힌 식사와 규칙적인 식습관을 통해 적절한 영양 섭취가 중요합니다.";
    } else if (midValue > 97) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>매우 높은</strong> 수준입니다. 균형 잡힌 식단과 적절한 신체 활동을 통해 건강한 체중 관리가 필요할 수 있습니다. 소아과 의사와 상담하여 건강한 체중 관리 방법을 알아보세요.";
    } else if (midValue > 90) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>높은</strong> 수준입니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 통해 건강한 체중을 유지하는 것이 좋습니다.";
    } else {
        element.innerHTML = "아이의 체중은 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 균형 잡힌 식습관을 유지하고 규칙적인 신체 활동을 장려하는 것이 건강한 체중 관리의 핵심입니다.";
    }
}

// 머리둘레 해석 업데이트
function updateHeadInterpretation(percentileRange) {
    const element = document.getElementById('headInterpretation');
    if (!element) return;
    
    // 백분위 범위에서 중앙값 추정
    let midValue;
    if (percentileRange === "< 3") {
        midValue = 1.5;
    } else if (percentileRange === "> 99") {
        midValue = 99.5;
    } else {
        const [min, max] = percentileRange.split('-').map(Number);
        midValue = (min + max) / 2;
    }
    
    if (midValue < 3) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>매우 작은</strong> 수준입니다. 소아과 의사와 상담하여 뇌 발달 상태를 확인하는 것이 좋습니다.";
    } else if (midValue < 10) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>작은</strong> 수준입니다. 정기적인 성장 모니터링을 통해 발달 추세를 확인하는 것이 중요합니다.";
    } else if (midValue > 97) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>매우 큰</strong> 수준입니다. 소아과 의사와 상담하여 정상적인 발달 범위인지 확인하는 것이 좋습니다.";
    } else if (midValue > 90) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>큰</strong> 수준입니다. 유전적 요인이 영향을 미쳤을 수 있으며, 정기적인 성장 모니터링이 중요합니다.";
    } else {
        element.innerHTML = "아이의 머리둘레는 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 머리둘레는 뇌 발달과 관련이 있으며, 특히 만 3세 이하 영유아에서 중요한 성장 지표입니다.";
    }
}

// 나이 계산 함수 (개월)
function calculateAgeInMonths(birthDate, currentDate) {
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += currentDate.getMonth() - birthDate.getMonth();
    
    if (currentDate.getDate() < birthDate.getDate()) {
        months--;
    }
    
    return Math.max(0, months);
}

// 나이 계산 함수 (일)
function calculateAgeInDays(birthDate, currentDate) {
    const diffTime = Math.abs(currentDate - birthDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 날짜 포맷 함수
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch (error) {
        return dateStr;
    }
}
