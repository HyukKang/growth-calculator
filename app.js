document.addEventListener('DOMContentLoaded', function() {
    // 생년월일에 따른 나이 계산 기능
    const birthDateInput = document.getElementById('birthDate');
    const ageDisplay = document.getElementById('ageDisplay');
    
    birthDateInput.addEventListener('change', function() {
        const birthdate = new Date(this.value);
        const today = new Date();
        
        // 날짜 유효성 검사
        if (isNaN(birthdate.getTime()) || birthdate > today) {
            ageDisplay.textContent = '유효한 생년월일을 입력해주세요.';
            return;
        }
        
        // 일 수 계산
        const diffTime = Math.abs(today - birthdate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // 개월 수 계산
        let months = (today.getFullYear() - birthdate.getFullYear()) * 12;
        months += today.getMonth() - birthdate.getMonth();
        if (today.getDate() < birthdate.getDate()) {
            months -= 1;
        }
        
        let ageText = '';
        if (months < 1) {
            ageText = `현재 ${diffDays}일 된 아이입니다.`;
        } else {
            ageText = `현재 ${months}개월 된 아이입니다. (${diffDays}일)`;
        }
        
        ageDisplay.textContent = ageText;
    });
    
    // 결과 버튼 클릭 이벤트
    const resultBtn = document.getElementById('resultBtn');
    
    resultBtn.addEventListener('click', function() {
        // Form validation
        const form = document.getElementById('growthForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form values
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const birthDate = document.getElementById('birthDate').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const headCircumference = document.getElementById('headCircumference').value;
        const dataSource = document.getElementById('dataSource').value;
        
        const queryParams = new URLSearchParams({
            gender,
            birthDate,
            height,
            weight,
            headCircumference,
            dataSource
        });
        
        // Open results in new page
        window.location.href = `results.html?${queryParams.toString()}`;
    });
});
