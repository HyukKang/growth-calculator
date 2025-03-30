document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const gender = params.get('gender');
    const birthDate = new Date(params.get('birthDate'));
    const height = parseFloat(params.get('height'));
    const weight = parseFloat(params.get('weight'));
    const head = params.get('headCircumference') ? parseFloat(params.get('headCircumference')) : null;
    const dataSource = params.get('dataSource');
    const ageMonths = calculateAgeInMonths(birthDate, new Date());

    const dataset = (dataSource === 'kdca' ? data.kdca : data.who)[gender];

    // UI 표시
    document.getElementById('childGender').textContent = gender === 'male' ? '남자' : '여자';
    document.getElementById('childBirthDate').textContent = formatDate(params.get('birthDate'));
    document.getElementById('dataStandard').textContent = dataSource === 'kdca' ? '질병관리청 기준' : 'WHO 기준';
    document.getElementById('childAge').textContent = `${ageMonths}개월 (${calculateAgeInDays(birthDate, new Date())}일)`;
    document.getElementById('heightValue').textContent = `${height} cm`;
    document.getElementById('weightValue').textContent = `${weight} kg`;
    document.getElementById('heightValueDetail').textContent = `${height} cm`;
    document.getElementById('weightValueDetail').textContent = `${weight} kg`;

    const heightPct = calculatePercentile(height, dataset.height, ageMonths);
    const weightPct = calculatePercentile(weight, dataset.weight, ageMonths);

    setResult('height', heightPct);
    setResult('weight', weightPct);

    if (head && dataset.headCircumference) {
        const headPct = calculatePercentile(head, dataset.headCircumference, ageMonths);
        document.getElementById('headValueDetail').textContent = `${head} cm`;
        setResult('head', headPct);
    }

    const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
    document.getElementById('bmiValue').textContent = `BMI: ${bmi}`;
    if (ageMonths >= 24 && dataset.bmi) {
        const bmiPct = calculatePercentile(bmi, dataset.bmi, ageMonths);
        setResult('bmi', bmiPct);
    } else {
        document.getElementById('bmiCard').style.display = 'none';
    }
});

function setResult(type, percentile) {
    document.getElementById(`${type}Percentile`).textContent = percentile;
    updateStatus(`${type}Status`, percentile);
}

function calculatePercentile(value, measurementData, ageInMonths) {
    const idx = getClosestIndex(measurementData.months, ageInMonths);
    const sorted = Object.entries(measurementData.percentiles)
        .sort((a, b) => a[1][idx] - b[1][idx]);

    for (const [label, values] of sorted) {
        if (value <= values[idx]) return label;
    }
    return sorted.at(-1)[0];
}

function getClosestIndex(arr, target) {
    return arr.reduce((closestIdx, curr, i) =>
        Math.abs(curr - target) < Math.abs(arr[closestIdx] - target) ? i : closestIdx, 0);
}
