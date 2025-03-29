document.addEventListener('DOMContentLoaded', function() {
    // URL 파라미터 파싱
    const urlParams = new URLSearchParams(window.location.search);
    const gender = urlParams.get('gender');
    const birthDate = urlParams.get('birthDate');
    const height = parseFloat(urlParams.get('height'));
    const weight = parseFloat(urlParams.get('weight'));
    const headCircumference = urlParams.get('headCircumference') ? parseFloat(urlParams.get('headCircumference')) : null;
    const dataSource = urlParams.get('dataSource');

    // 데이터 선택 (수정됨)
    const sourceData = dataSource === 'kdca' ? data.kdca : data.who;
    const genderData = sourceData[gender];

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
    document.getElementById('childAge').textContent = `${ageInMonths}개월 (${ageInDays}일)`;

    // 백분위수 계산 (수정됨)
    const heightPercentile = calculatePercentile(height, genderData.height, ageInMonths);
    const weightPercentile = calculatePercentile(weight, genderData.weight, ageInMonths);
    let headPercentile = null;
    if (headCircumference) {
        headPercentile = calculatePercentile(headCircumference, genderData.headCircumference, ageInMonths);
    }

    // BMI 계산 (수정됨)
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bmiFormatted = bmi.toFixed(1);
    document.getElementById('bmiValue').textContent = `BMI: ${bmiFormatted}`;

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

    // 상태 표시
    updateStatus('heightStatus', heightPercentile);
    updateStatus('weightStatus', weightPercentile);
    if (headCircumference) {
        updateStatus('headStatus', headPercentile);
    }
});

// 💡 수정된 백분위 계산 함수
function calculatePercentile(value, measurementData, ageInMonths) {
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

    const percentiles = measurementData.percentiles;
    let closestPercentile = null;

    for (const percentile in percentiles) {
        const percentileArray = percentiles[percentile];
        const percentileValue = percentileArray[closestMonthIndex];

        if (value <= percentileValue) {
            closestPercentile = percentile;
            break;
        }
    }

    return closestPercentile ? closestPercentile : "알 수 없음";
}
