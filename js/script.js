(function() {
  'use strict';

  const main = document.querySelector('.main');
  const qna = document.querySelector('.qna');
  const result = document.querySelector('.result');
  const startButton = document.querySelector('.btn-start');
  const restartButton = document.querySelector('.btn-restart');
  const answerButtons = document.querySelectorAll('.answer-btn');
  
  // const server = 'https://dev-suzu.click';
  
  // 상태 변수
  let shuffledQnaList = [];
  let currentPage = 0;

  // 초기화
  function init() {
    startButton.addEventListener('click', start);
    restartButton.addEventListener('click', retest);
    
    answerButtons.forEach(button => {
      button.addEventListener('click', function() {
        const type = this.dataset.type; // 해당 버튼의 data-type 속성 가져옴
        if (type) { // type이 존재할 경우에만 select 호출
          select(type);
        }
      });
    });
    
    // 링크 및 카카오 공유 버튼
    document.querySelector('.btn-link').addEventListener('click', onClickCopyLink);
    document.querySelector('.btn-kakao').addEventListener('click', kakaoShare);
    
    // 참여자 수 로드
    fetchParticipantCount();
    
    // 질문 준비
    prepareQuestions();
  }

  // 참여자 수 반환
  function fetchParticipantCount() {
    // Fetch API 
    fetch(`${server}/mbti/count`, { 
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
      if (!response.ok) throw new Error('네트워크 응답 오류');
      return response.json();
    })
    .then(data => {
      document.querySelector(".participants-count").textContent = data.participantCount;
    })
    .catch(error => {
      console.error("참여자 수 로드 실패:", error);
    });
  }

  // 질문 준비 및 섞기
  function prepareQuestions() {
    shuffledQnaList = [...qnaList]; // 새 배열로 복사
    shuffleArray(shuffledQnaList);
    updateQuestion(0);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 테스트 시작
  function start() {
    main.style.display = "none";
    qna.style.display = "block";
    result.style.display = "none";
    
    currentPage = 0;
    updateQuestion(currentPage);
  }

  // 질문 업데이트
  function updateQuestion(pageIdx) {
    const question = document.querySelector(".question h2");
    const answerButtons = document.querySelectorAll(".answer-btn");
    const pageCnt = document.querySelector(".page .now");
    
    // 질문 업데이트
    question.innerHTML = qnaList[pageIdx].q;
    
    // 답변 버튼 업데이트
    answerButtons[0].innerHTML = qnaList[pageIdx].a[0].answer;
    answerButtons[0].dataset.type = qnaList[pageIdx].a[0].type;
    
    answerButtons[1].innerHTML = qnaList[pageIdx].a[1].answer;
    answerButtons[1].dataset.type = qnaList[pageIdx].a[1].type;
    
    // 페이지 카운터 업데이트
    pageCnt.textContent = pageIdx + 1;
  }

  // 점수 증가
  function select(type) {
    const mbtiType = document.querySelector(`.qna input[id=${type}]`);
    mbtiType.value = parseInt(mbtiType.value) + 1;
    
    currentPage++;
    
    if (currentPage < 12) {
      updateQuestion(currentPage);
    } else {
      end();
    }
  }

  // 결과 계산 및 표시 (서버 연동)
  // function end() {
  //   qna.style.display = "none";
  //   result.style.display = "block";
  //   document.querySelector(".result .loader").style.display = "block";
  //   document.querySelector(".result .result-contents").style.display = "none";

  //   const mbtiData = {
  //     E: parseInt(document.getElementById("E").value),
  //     I: parseInt(document.getElementById("I").value),
  //     S: parseInt(document.getElementById("S").value),
  //     N: parseInt(document.getElementById("N").value),
  //     T: parseInt(document.getElementById("T").value),
  //     F: parseInt(document.getElementById("F").value),
  //     P: parseInt(document.getElementById("P").value),
  //     J: parseInt(document.getElementById("J").value)
  //   };

  //   // Fetch API
  //   fetch(`${server}/mbti/result`, {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: JSON.stringify(mbtiData)
  //   })
  //   .then(response => {
  //     if (!response.ok) throw new Error('서버 응답 오류');
  //     return response.json();
  //   })
  //   .then(data => {
  //     displayResult(data);
  //   })
  //   .catch(error => {
  //     console.error("결과 처리 오류:", error);
  //     alert("결과를 불러오는 데 문제가 발생했습니다. 다시 시도해주세요.");
  //     qna.style.display = "block";
  //     result.style.display = "none";
  //   })
  //   .finally(() => {
  //     mbtiReset();
  //   });
  // }

  function end() {
    qna.style.display = "none";
    result.style.display = "block";
    document.querySelector(".result .loader").style.display = "block";
    document.querySelector(".result .result-contents").style.display = "none";
  
    // MBTI 점수 계산
    const mbtiScores = {
      E: parseInt(document.getElementById("E").value),
      I: parseInt(document.getElementById("I").value),
      S: parseInt(document.getElementById("S").value),
      N: parseInt(document.getElementById("N").value),
      T: parseInt(document.getElementById("T").value),
      F: parseInt(document.getElementById("F").value),
      P: parseInt(document.getElementById("P").value),
      J: parseInt(document.getElementById("J").value)
    };
  
    // MBTI 타입 결정
    const mbtiType = 
      (mbtiScores.E > mbtiScores.I ? "E" : "I") +
      (mbtiScores.S > mbtiScores.N ? "S" : "N") +
      (mbtiScores.T > mbtiScores.F ? "T" : "F") +
      (mbtiScores.P > mbtiScores.J ? "P" : "J");
    
    displayResult(mbtiType);
    mbtiReset();
  }
  
  // 결과 표시
  function displayResult(mbtiType) {
    // 결과 데이터 찾기
    const detailObject = detail.find(obj => Object.keys(obj)[0] === mbtiType);
    
    // 결과 데이터가 없는 경우
    if (!detailObject) {
      console.error(`"${mbtiType}" 유형에 해당하는 결과가 없습니다. 기본값 사용`);
      mbtiType = "ESFP"; 
      
      const defaultDetail = detail.find(obj => Object.keys(obj)[0] === "ESFP");
      if (!defaultDetail) {
        // 기본 유형도 없는 경우 하드코딩된 기본값 사용
        displayDefaultResult();
        return;
      }
      detailObject = defaultDetail;
    }
    
    const resultData = detailObject[mbtiType];
    const { h3, p, good, bad, resultDesc } = resultData;
    
    document.querySelector(".result h3").textContent = h3;
    document.querySelector(".result-strong").innerHTML = p;
    document.querySelector(".result-fit .good span").innerHTML = good;
    document.querySelector(".result-fit .bad span").innerHTML = bad;
    
    const ulResultDesc = document.querySelector(".result-desc");
    ulResultDesc.innerHTML = "";
    
    resultDesc.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ulResultDesc.appendChild(li);
    });
    
    const resultImage = document.querySelector(".result-contents img");
    resultImage.src = `./img/${mbtiType}.jpg`;
    resultImage.alt = `${h3} 캐릭터 이미지`;
    
    resultImage.onload = () => {
      document.querySelector(".result .loader").style.display = "none";
      document.querySelector(".result .result-contents").style.display = "block";
    };
    
    resultImage.onerror = () => {
      console.error("이미지 로드 실패");
      document.querySelector(".result .loader").style.display = "none";
      document.querySelector(".result .result-contents").style.display = "block";
    };
  }

  // 결과 데이터가 없는 경우 (기본값)
  function displayDefaultResult() {
    document.querySelector(".result h3").innerText = "'친화력 갑 주인공 단짝친구 캐릭터'";
    document.querySelector(".result-strong").innerHTML = "고민이 있을 때 찾아가게 되는 다정한 상담 선생님이에요.<br>";
    document.querySelector(".result-fit .good span").innerHTML = "'친화력 갑 주인공 단짝친구 캐릭터'";
    document.querySelector(".result-fit .bad span").innerHTML = "'폼생폼사 탐정'";
    
    const ulResultDesc = document.querySelector(".result-desc");
    ulResultDesc.innerHTML = "<li>세상 근심 걱정이 없는 편이에요.</li>";
    
    document.querySelector(".result-contents img").src = `./img/ESFP.jpg`;
    document.querySelector(".result-contents img").alt = "ESFP 캐릭터 이미지";
    
    document.querySelector(".result .loader").style.display = "none";
    document.querySelector(".result .result-contents").style.display = "block";
  }

  // 테스트 다시하기
  function retest() {
    main.style.display = "block";
    qna.style.display = "none";
    result.style.display = "none";
    mbtiReset();
  }

  // MBTI 값 초기화
  function mbtiReset() {
    const mbtiTypes = ["E", "I", "S", "N", "T", "F", "P", "J"];
    mbtiTypes.forEach(type => {
      document.getElementById(type).value = 0;
    });
  }

  // 링크 복사
  async function onClickCopyLink() {
    try {
      const link = window.location.href;
      await navigator.clipboard.writeText(link);
      alert('링크가 복사되었습니다.');
    } catch (error) {
      console.error("링크 복사 오류:", error);
      alert('링크 복사에 실패했습니다. 주소를 직접 복사해주세요.');
    }
  }

  // 카카오톡 공유
  function kakaoShare() {
    if (!Kakao.isInitialized()) {
      Kakao.init('e03007817ef0e47b7c1ee1c73847a70e'); // API key
    }
    // 공유 정보 설정 및 실행
    Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: '나에게 어울리는 영화 캐릭터는?',
        description: 'MBTI 기반 영화 캐릭터 테스트',
        imageUrl: 'https://dev-suzu.click/img/main.jpg',
        link: {
          mobileWebUrl: 'https://dev-suzu.click',
          webUrl: 'https://dev-suzu.click',
        },
      },
      buttons: [
        {
          title: '테스트 하러가기',
          link: {
            mobileWebUrl: 'https://dev-suzu.click',
            webUrl: 'https://dev-suzu.click',
          },
        },
      ],
      installTalk: true,
    });
  }

  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', init);

  window.select = select;
  window.kakaoShare = kakaoShare;
  window.onClickCopyLink = onClickCopyLink;
})();