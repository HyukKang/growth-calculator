// results.js - 간소화된 버전으로 기본 기능만 구현
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
    document.getElementById('dataStandard').textContent = dataSource === 'kdca' ? '질병관리청 기준' : 'WHO 기준';
    
    // 나이 계산
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    const ageMonths = calculateAgeInMonths(birthDate, today);
    const ageDays = calculateAgeInDays(birthDate, today);
    
    document.getElementById('childAge').textContent = `${ageMonths}개월 (${ageDays}일)`;
    console.log("나이 계산 완료:", ageMonths, ageDays);
    
    try {
        // 데이터셋 선택
        const dataset = data[dataSource][gender];
        console.log("데이터셋 선택됨:", dataSource, gender);
        console.log("데이터셋 구조:", Object.keys(dataset));
        
        // 백분위 계산
        calculateAndDisplayPercentiles(dataset, height, weight, headCircumference, ageMonths);
        
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
    }
    
    // 체중 백분위 계산
    if (dataset.weight) {
        const weightPercentile = findPercentileRange(weight, dataset.weight, ageMonths);
        console.log("체중 백분위:", weightPercentile);
        document.getElementById('weightPercentile').textContent = weightPercentile;
        document.getElementById('weightValueDetail').textContent = `${weight} kg`;
        updateStatus('weightStatus', weightPercentile);
    }
    
    // 머리둘레 백분위 계산 (있는 경우만)
    if (headCircumference && dataset.headCircumference && ageMonths <= 72) {
        const headPercentile = findPercentileRange(headCircumference, dataset.headCircumference, Math.min(ageMonths, 72));
        console.log("머리둘레 백분위:", headPercentile);
        document.getElementById('headPercentile').textContent = headPercentile;
        document.getElementById('headValueDetail').textContent = `${headCircumference} cm`;
        updateStatus('headStatus', headPercentile);
    } else {
        // 머리둘레 데이터가 없거나 너무 나이가 많은 경우
        const headCard = document.querySelector('.card:has(#headPercentile)');
        if (headCard) headCard.style.display = 'none';
        const headTab = document.getElementById('head-tab');
        if (headTab) headTab.style.display = 'none';
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
    }
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
    if (!element) return;
    
    let category, description;
    
    if (bmi < 14) {
        category = "저체중";
        description = "BMI가 5백분위수 미만으로, 저체중에 해당합니다. 균형 잡힌 영양 섭취가 필요할 수 있습니다.";
    } else if (bmi < 17) {
        category = "정상체중";
        description = "BMI가 5-85백분위수 사이로, 정상체중에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 유지하세요.";
    } else if (bmi < 19) {
        category = "과체중";
        description = "BMI가 85-95백분위수 사이로, 과체중에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동이 중요합니다.";
    } else {
        category = "비만";
        description = "BMI가 95백분위수 이상으로, 비만에 해당합니다. 소아과 의사와 상담하여 건강한 생활습관에 대해 논의하세요.";
    }
    
    element.innerHTML = description;
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
