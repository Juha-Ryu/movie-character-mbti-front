const main = document.querySelector('.main');
const qna = document.querySelector('.qna');
const result = document.querySelector('.result');
const startButton = document.querySelector('.btn-start');

function start() {
  main.style.display = "none";
  qna.style.display = "block";
  result.style.display = "none";

  next(0);
}

// 참여자 수 반환
$(document).ready(function() {
  $.ajax({
    url: `${server}/mbti/count`,  
    headers: {'Content-Type': 'application/json'},
    method: "GET",
    success: function(data) {
        $(".participants-count").text(data.participantCount);
    },
    error: function(xhr, status, error) {
        console.error("AJAX 요청 실패:", error);
    }
  });
});

startButton.addEventListener('click', start);

function next(pageIdx) {
  let question = document.querySelector(".question h2");
  let answerA = document.querySelector(".answers .a");
  let answerB = document.querySelector(".answers .b");
  let page = document.querySelector("input[id='page']");
  let pageCnt = document.querySelector(".page .now");

  question.innerHTML = qnaList[pageIdx].q;
  answerA.href = `javascript:select('${qnaList[pageIdx].a[0].type}')`;
  answerA.innerHTML = qnaList[pageIdx].a[0].answer;
  answerB.href = `javascript:select('${qnaList[pageIdx].a[1].type}')`;
  answerB.innerHTML = qnaList[pageIdx].a[1].answer;

  page.value = ++pageIdx;
  pageCnt.innerText = pageIdx;
}

function select(type) {
  let mbtiType = document.querySelector(`.qna input[id=${type}]`);
  let pageIdx = document.querySelector("input[id='page']").value;

  mbtiType.value = ++mbtiType.value;

  if (pageIdx < 12) {
    next(pageIdx);
  } else {
    end();
  }
}

function end() {
  qna.style.display = "none";
  result.style.display = "block";

  let mbti = JSON.stringify({
    E : document.getElementById("E").value,
    I : document.getElementById("I").value,
    S : document.getElementById("S").value,
    N : document.getElementById("N").value,
    T : document.getElementById("T").value,
    F : document.getElementById("F").value,
    P : document.getElementById("P").value,
    J : document.getElementById("J").value
  });

  mbtiReset();

  // mbti 결과 반환
  $.ajax({
    url : `${server}/mbti/result`,
    headers: {'Content-Type': 'application/json'},
    data : mbti,
    method : "POST",

    success: function (data) {
      const detailObject = detail.find(obj => Object.keys(obj)[0] === data);
  
      if (detailObject) {
        const { h3, p } = detailObject[Object.keys(detailObject)[0]];
        const resultDesc = detailObject[Object.keys(detailObject)[0]].resultDesc;

        document.querySelector(".result .result-contents h3").innerText = h3;
        document.querySelector(".result .result-contents .result-strong").innerHTML = p;

        const ulResultDesc = document.querySelector(".result .result-contents .result-desc");
        ulResultDesc.innerHTML = ""; 

        resultDesc.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          ulResultDesc.appendChild(li);
        });
      } else {
        console.log("해당하는 결과가 없습니다.");
      }
  
      // 이미지 로드 완료 후 로딩 표시 숨김 및 결과 표시
      document.querySelector(".result .result-contents img").src = `./img/${data}.jpg`;
      document.querySelector(".result .loader").style.display = "none";
      document.querySelector(".result .result-contents").style.display = "block";
    },

    error: function(request, status, error) {
      qna.style.display = "block";
      result.style.display = "none";

      console.log(error);
    }
  });
}

function retest() {
  main.style.display = "flex";
  qna.style.display = "none";
  result.style.display = "none";
}

function mbtiReset() {
  document.getElementById("E").value = 0;
  document.getElementById("I").value = 0;
  document.getElementById("S").value = 0;
  document.getElementById("N").value = 0;
  document.getElementById("T").value = 0;
  document.getElementById("F").value = 0;
  document.getElementById("P").value = 0;
  document.getElementById("J").value = 0;
}