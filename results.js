document.addEventListener('DOMContentLoaded', () => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const gender = params.get('gender');
    const birthDateStr = params.get('birthDate');
    const height = parseFloat(params.get('height'));
    const weight = parseFloat(params.get('weight'));
    const headCircumference = params.get('headCircumference') ? parseFloat(params.get('headCircumference')) : null;
    const dataSource = params.get('dataSource');
    
    // Validate data
    if (!gender || !birthDateStr || !height || !weight || !dataSource) {
        alert('필요한 정보가 누락되었습니다. 다시 시도해주세요.');
        window.location.href = 'index.html';
        return;
    }
    
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    const ageMonths = calculateAgeInMonths(birthDate, today);
    const ageDays = calculateAgeInDays(birthDate, today);
    
    // Get appropriate dataset
    const dataset = (dataSource === 'kdca' ? data.kdca : data.who)[gender];
    
    // Update UI with basic information
    document.getElementById('childGender').textContent = gender === 'male' ? '남자' : '여자';
    document.getElementById('childBirthDate').textContent = formatDate(birthDateStr);
    document.getElementById('dataStandard').textContent = dataSource === 'kdca' ? '질병관리청 기준' : 'WHO 기준';
    document.getElementById('childAge').textContent = `${ageMonths}개월 (${ageDays}일)`;
    document.getElementById('heightValue').textContent = `${height} cm`;
    document.getElementById('weightValue').textContent = `${weight} kg`;
    document.getElementById('heightValueDetail').textContent = `${height} cm`;
    document.getElementById('weightValueDetail').textContent = `${weight} kg`;
    
    // Calculate percentiles
    const heightPercentile = calculatePercentile(height, dataset.height, ageMonths);
    const weightPercentile = calculatePercentile(weight, dataset.weight, ageMonths);
    
    // Set results for height and weight
    setResult('height', heightPercentile);
    setResult('weight', weightPercentile);
    
    // Handle head circumference if provided
    if (headCircumference && dataset.headCircumference) {
        // Show only if age is appropriate (typically under 3 years)
        if (ageMonths <= 36) {
            const headPercentile = calculatePercentile(headCircumference, dataset.headCircumference, Math.min(ageMonths, dataset.headCircumference.months[dataset.headCircumference.months.length - 1]));
            document.getElementById('headValueDetail').textContent = `${headCircumference} cm`;
            setResult('head', headPercentile);
        } else {
            // Hide head circumference section for older children
            document.querySelector('.card:has(#headPercentile)').style.display = 'none';
            document.getElementById('head-tab').style.display = 'none';
            document.getElementById('head-chart').style.display = 'none';
        }
    } else {
        // No head circumference provided
        document.querySelector('.card:has(#headPercentile)').style.display = 'none';
        document.getElementById('head-tab').style.display = 'none';
        document.getElementById('head-chart').style.display = 'none';
    }
    
    // Calculate BMI (only relevant for children 2 years or older)
    const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
    document.getElementById('bmiValue').textContent = `BMI: ${bmi}`;
    
    if (ageMonths >= 24) {
        const bmiPercentile = calculateBMIPercentile(bmi, height, weight, ageMonths, gender, dataSource);
        setResult('bmi', bmiPercentile);
        updateBMIInterpretation(bmiPercentile);
    } else {
        // Hide BMI section for children under 2 years
        document.getElementById('bmiCard').style.display = 'none';
        document.getElementById('bmi-tab').style.display = 'none';
        document.getElementById('bmi-chart').style.display = 'none';
    }
    
    // Draw charts
    drawHeightChart(dataset.height, ageMonths, height);
    drawWeightChart(dataset.weight, ageMonths, weight);
    if (headCircumference && dataset.headCircumference && ageMonths <= 36) {
        drawHeadChart(dataset.headCircumference, ageMonths, headCircumference);
    }
    if (ageMonths >= 24) {
        drawBMIChart(ageMonths, bmi);
    }
    
    // Update interpretations
    updateHeightInterpretation(heightPercentile);
    updateWeightInterpretation(weightPercentile);
    if (headCircumference && ageMonths <= 36) {
        updateHeadInterpretation(calculatePercentile(headCircumference, dataset.headCircumference, ageMonths));
    }
});

// Calculate age in months
function calculateAgeInMonths(birthDate, currentDate) {
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += currentDate.getMonth() - birthDate.getMonth();
    
    if (currentDate.getDate() < birthDate.getDate()) {
        months--;
    }
    
    return Math.max(0, months);
}

// Calculate age in days
function calculateAgeInDays(birthDate, currentDate) {
    const diffTime = Math.abs(currentDate - birthDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Format date as YYYY-MM-DD
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// Calculate percentile based on measurement
function calculatePercentile(value, measurementData, ageInMonths) {
    // Find the closest age index in the data
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
    
    // Extract percentile values for this age
    const percentiles = {
        p1: measurementData.percentiles.p1[closestMonthIndex],
        p3: measurementData.percentiles.p3[closestMonthIndex],
        p5: measurementData.percentiles.p5[closestMonthIndex],
        p10: measurementData.percentiles.p10[closestMonthIndex],
        p15: measurementData.percentiles.p15[closestMonthIndex],
        p25: measurementData.percentiles.p25[closestMonthIndex],
        p50: measurementData.percentiles.p50[closestMonthIndex],
        p75: measurementData.percentiles.p75[closestMonthIndex],
        p85: measurementData.percentiles.p85[closestMonthIndex],
        p90: measurementData.percentiles.p90[closestMonthIndex],
        p95: measurementData.percentiles.p95[closestMonthIndex],
        p97: measurementData.percentiles.p97[closestMonthIndex],
        p99: measurementData.percentiles.p99[closestMonthIndex]
    };
    
    // Find the percentile range for the value
    if (value < percentiles.p1) return "< 1";
    if (value < percentiles.p3) return "1-3";
    if (value < percentiles.p5) return "3-5";
    if (value < percentiles.p10) return "5-10";
    if (value < percentiles.p15) return "10-15";
    if (value < percentiles.p25) return "15-25";
    if (value < percentiles.p50) return "25-50";
    if (value < percentiles.p75) return "50-75";
    if (value < percentiles.p85) return "75-85";
    if (value < percentiles.p90) return "85-90";
    if (value < percentiles.p95) return "90-95";
    if (value < percentiles.p97) return "95-97";
    if (value < percentiles.p99) return "97-99";
    return "> 99";
}

// Calculate BMI percentile
function calculateBMIPercentile(bmi, height, weight, ageInMonths, gender, dataSource) {
    // This is a simplified version - ideally, we would have BMI percentile data
    // For now, we'll use weight percentile as an approximation
    const dataset = (dataSource === 'kdca' ? data.kdca : data.who)[gender];
    return calculatePercentile(weight, dataset.weight, ageInMonths);
}

// Set result and update status
function setResult(type, percentile) {
    document.getElementById(`${type}Percentile`).textContent = percentile;
    updateStatus(`${type}Status`, percentile);
}

// Update status class and text based on percentile
function updateStatus(elementId, percentile) {
    const element = document.getElementById(elementId);
    
    // Extract the numeric range from the percentile
    let numericRange;
    if (percentile === "< 1") {
        numericRange = 0.5;
    } else if (percentile === "> 99") {
        numericRange = 99.5;
    } else {
        // Parse ranges like "25-50" to get middle value
        const parts = percentile.split('-');
        numericRange = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    
    // Set status based on percentile range
    if (numericRange < 3) {
        element.textContent = "매우 낮음";
        element.className = "mt-2 fw-bold status-alert";
    } else if (numericRange < 10) {
        element.textContent = "낮음";
        element.className = "mt-2 fw-bold status-warning";
    } else if (numericRange > 97) {
        element.textContent = "매우 높음";
        element.className = "mt-2 fw-bold status-alert";
    } else if (numericRange > 90) {
        element.textContent = "높음";
        element.className = "mt-2 fw-bold status-warning";
    } else {
        element.textContent = "정상 범위";
        element.className = "mt-2 fw-bold status-normal";
    }
}

// Update height interpretation
function updateHeightInterpretation(percentile) {
    const element = document.getElementById('heightInterpretation');
    
    // Extract the numeric range
    let numericRange;
    if (percentile === "< 1") {
        numericRange = 0.5;
    } else if (percentile === "> 99") {
        numericRange = 99.5;
    } else {
        const parts = percentile.split('-');
        numericRange = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    
    if (numericRange < 3) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>매우 낮은</strong> 수준입니다. 소아과 의사와 상담하여 성장 지연 가능성을 확인하는 것이 좋습니다. 균형 잡힌 영양 섭취와 충분한 수면이 중요합니다.";
    } else if (numericRange < 10) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>낮은</strong> 수준입니다. 단, 개인차가 있으므로 지속적인 성장 추세를 확인하는 것이 중요합니다. 균형 잡힌 영양 섭취와 충분한 수면이 도움이 될 수 있습니다.";
    } else if (numericRange > 97) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>매우 높은</strong> 수준입니다. 유전적인 영향이나 조기 성장 가능성이 있을 수 있습니다. 정기적인 성장 모니터링이 중요합니다.";
    } else if (numericRange > 90) {
        element.innerHTML = "아이의 신장은 또래 평균보다 <strong>높은</strong> 수준입니다. 이는 정상적인 범위 내에 있으며, 유전적 요인이 영향을 미쳤을 수 있습니다.";
    } else {
        element.innerHTML = "아이의 신장은 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 꾸준한 성장을 유지하고 있으며, 균형 잡힌 영양 섭취와 적절한 운동은 건강한 신장 발달에 중요합니다.";
    }
}

// Update weight interpretation
function updateWeightInterpretation(percentile) {
    const element = document.getElementById('weightInterpretation');
    
    // Extract the numeric range
    let numericRange;
    if (percentile === "< 1") {
        numericRange = 0.5;
    } else if (percentile === "> 99") {
        numericRange = 99.5;
    } else {
        const parts = percentile.split('-');
        numericRange = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    
    if (numericRange < 3) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>매우 낮은</strong> 수준입니다. 소아과 의사와 상담하여 영양 상태를 확인하는 것이 좋습니다. 균형 잡힌 영양 섭취가 매우 중요합니다.";
    } else if (numericRange < 10) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>낮은</strong> 수준입니다. 균형 잡힌 식사와 규칙적인 식습관을 통해 적절한 영양 섭취가 중요합니다.";
    } else if (numericRange > 97) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>매우 높은</strong> 수준입니다. 균형 잡힌 식단과 적절한 신체 활동을 통해 건강한 체중 관리가 필요할 수 있습니다. 소아과 의사와 상담하여 건강한 체중 관리 방법을 알아보세요.";
    } else if (numericRange > 90) {
        element.innerHTML = "아이의 체중은 또래 평균보다 <strong>높은</strong> 수준입니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 통해 건강한 체중을 유지하는 것이 좋습니다.";
    } else {
        element.innerHTML = "아이의 체중은 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 균형 잡힌 식습관을 유지하고 규칙적인 신체 활동을 장려하는 것이 건강한 체중 관리의 핵심입니다.";
    }
}

// Update head circumference interpretation
function updateHeadInterpretation(percentile) {
    const element = document.getElementById('headInterpretation');
    
    // Extract the numeric range
    let numericRange;
    if (percentile === "< 1") {
        numericRange = 0.5;
    } else if (percentile === "> 99") {
        numericRange = 99.5;
    } else {
        const parts = percentile.split('-');
        numericRange = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    
    if (numericRange < 3) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>매우 작은</strong> 수준입니다. 소아과 의사와 상담하여 뇌 발달 상태를 확인하는 것이 좋습니다.";
    } else if (numericRange < 10) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>작은</strong> 수준입니다. 정기적인 성장 모니터링을 통해 발달 추세를 확인하는 것이 중요합니다.";
    } else if (numericRange > 97) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>매우 큰</strong> 수준입니다. 소아과 의사와 상담하여 정상적인 발달 범위인지 확인하는 것이 좋습니다.";
    } else if (numericRange > 90) {
        element.innerHTML = "아이의 머리둘레는 또래 평균보다 <strong>큰</strong> 수준입니다. 유전적 요인이 영향을 미쳤을 수 있으며, 정기적인 성장 모니터링이 중요합니다.";
    } else {
        element.innerHTML = "아이의 머리둘레는 또래 아이들과 비교하여 <strong>정상 범위</strong> 내에 있습니다. 머리둘레는 뇌 발달과 관련이 있으며, 특히 만 3세 이하 영유아에서 중요한 성장 지표입니다.";
    }
}

// Update BMI interpretation
function updateBMIInterpretation(percentile) {
    const element = document.getElementById('bmiInterpretation');
    const chartElement = document.getElementById('bmiChartInterpretation');
    
    // Extract the numeric range
    let numericRange;
    if (percentile === "< 1") {
        numericRange = 0.5;
    } else if (percentile === "> 99") {
        numericRange = 99.5;
    } else {
        const parts = percentile.split('-');
        numericRange = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    
    let interpretation;
    
    if (numericRange < 5) {
        interpretation = "BMI 백분위수가 5 미만으로, <strong>저체중</strong>에 해당합니다. 균형 잡힌 영양 섭취가 필요할 수 있으며, 소아과 의사와 상담하는 것이 좋습니다.";
    } else if (numericRange < 85) {
        interpretation = "BMI 백분위수가 5-85 사이로, <strong>정상체중</strong>에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 유지하는 것이 중요합니다.";
    } else if (numericRange < 95) {
        interpretation = "BMI 백분위수가 85-95 사이로, <strong>과체중</strong>에 해당합니다. 균형 잡힌 식습관과 규칙적인 신체 활동을 통해 건강한 체중 관리가 필요합니다.";
    } else {
        interpretation = "BMI 백분위수가 95 이상으로, <strong>비만</strong>에 해당합니다. 소아과 의사와 상담하여 건강한 체중 관리 방법을 알아보는 것이 좋습니다.";
    }
    
    element.innerHTML = interpretation;
    if (chartElement) chartElement.innerHTML = interpretation;
}

// Draw height chart
function drawHeightChart(heightData, ageMonths, currentHeight) {
    const ctx = document.getElementById('heightChartCanvas').getContext('2d');
    
    // Prepare data for chart
    const labels = heightData.months.filter(month => month <= ageMonths + 12 && month >= Math.max(0, ageMonths - 12));
    const p3 = labels.map((month, i) => heightData.percentiles.p3[heightData.months.indexOf(month)]);
    const p50 = labels.map((month, i) => heightData.percentiles.p50[heightData.months.indexOf(month)]);
    const p97 = labels.map((month, i) => heightData.percentiles.p97[heightData.months.indexOf(month)]);
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '3백분위',
                    data: p3,
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '50백분위 (중앙값)',
                    data: p50,
                    borderColor: 'rgba(54, 162, 235, 0.7)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '97백분위',
                    data: p97,
                    borderColor: 'rgba(255, 206, 86, 0.7)',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '현재 신장',
                    data: Array(labels.length).fill(null),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 0,
                    pointRadius: 8,
                    pointStyle: 'circle',
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
                        text: '머리둘레 (cm)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '머리둘레 성장 도표',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
    
    // Update the current point
    const currentIndex = labels.indexOf(ageMonths);
    if (currentIndex !== -1) {
        ctx.chart.data.datasets[3].data[currentIndex] = currentHead;
        ctx.chart.update();
    }
}

// Draw BMI chart
function drawBMIChart(ageMonths, currentBMI) {
    const ctx = document.getElementById('bmiChartCanvas').getContext('2d');
    
    // Create chart with simple BMI categories
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['저체중 (< 5%)', '정상 (5-84%)', '과체중 (85-94%)', '비만 (≥ 95%)'],
            datasets: [{
                label: 'BMI 카테고리',
                data: [5, 80, 10, 5],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '백분위 범위 (%)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'BMI 카테고리 분포',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}: {
                        display: true,
                        text: '나이 (개월)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '신장 (cm)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '신장 성장 도표',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
    
    // Update the current point
    const currentIndex = labels.indexOf(ageMonths);
    if (currentIndex !== -1) {
        ctx.chart.data.datasets[3].data[currentIndex] = currentHeight;
        ctx.chart.update();
    }
}

// Draw weight chart
function drawWeightChart(weightData, ageMonths, currentWeight) {
    const ctx = document.getElementById('weightChartCanvas').getContext('2d');
    
    // Prepare data for chart
    const labels = weightData.months.filter(month => month <= ageMonths + 12 && month >= Math.max(0, ageMonths - 12));
    const p3 = labels.map((month, i) => weightData.percentiles.p3[weightData.months.indexOf(month)]);
    const p50 = labels.map((month, i) => weightData.percentiles.p50[weightData.months.indexOf(month)]);
    const p97 = labels.map((month, i) => weightData.percentiles.p97[weightData.months.indexOf(month)]);
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '3백분위',
                    data: p3,
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '50백분위 (중앙값)',
                    data: p50,
                    borderColor: 'rgba(54, 162, 235, 0.7)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '97백분위',
                    data: p97,
                    borderColor: 'rgba(255, 206, 86, 0.7)',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '현재 체중',
                    data: Array(labels.length).fill(null),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 0,
                    pointRadius: 8,
                    pointStyle: 'circle',
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
                        text: '체중 (kg)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '체중 성장 도표',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
    
    // Update the current point
    const currentIndex = labels.indexOf(ageMonths);
    if (currentIndex !== -1) {
        ctx.chart.data.datasets[3].data[currentIndex] = currentWeight;
        ctx.chart.update();
    }
}

// Draw head circumference chart
function drawHeadChart(headData, ageMonths, currentHead) {
    const ctx = document.getElementById('headChartCanvas').getContext('2d');
    
    // Prepare data for chart
    const labels = headData.months.filter(month => month <= ageMonths + 12 && month >= Math.max(0, ageMonths - 12));
    const p3 = labels.map((month, i) => headData.percentiles.p3[headData.months.indexOf(month)]);
    const p50 = labels.map((month, i) => headData.percentiles.p50[headData.months.indexOf(month)]);
    const p97 = labels.map((month, i) => headData.percentiles.p97[headData.months.indexOf(month)]);
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '3백분위',
                    data: p3,
                    borderColor: 'rgba(255, 99, 132, 0.7)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '50백분위 (중앙값)',
                    data: p50,
                    borderColor: 'rgba(54, 162, 235, 0.7)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '97백분위',
                    data: p97,
                    borderColor: 'rgba(255, 206, 86, 0.7)',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: '현재 머리둘레',
                    data: Array(labels.length).fill(null),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 0,
                    pointRadius: 8,
                    pointStyle: 'circle',
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title
