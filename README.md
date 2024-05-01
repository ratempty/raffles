<br>


#### 🏠 배포 주소 : [응모했슈](https://www.didyouraffles.site)
#### 🧑🏾‍💻 작업 로그 : [Notion](https://teamsparta.notion.site/696c0f382eea43419210446ad3fa374a)
#### 📹 소개 영상 : [youtube]()
#### 📑 브로 슈어 : [Brochure](https://teamsparta.notion.site/6fbad4c6d6e3431386fd6d487d412364)

-------------------

<br>

# 📝 Intro

* **프로젝트명** : 응모했슈
* **기간** : 2024년 3월 26일 ~ 2024년 5월 2일
* **주제** : 신발 응모 정보 및 뉴스 조회 & 개인간 신발 거래 시스템

<br>

# 👨‍👩‍👧‍👦Team Members

| Position      | Name          |    Github                                         | Tech Blog                               |
|:--------------|:--------------|:--------------------------------------------------|-----------------------------------------|
| Backend       | 강다빈        | [ratempty](https://github.com/ratempty)           |https://rate-allempty.tistory.com/       |
| Backend       | 이재헌        | [wogjs5656](https://github.com/wogjs5656)         |https://jaehoring.tistory.com/           |
| Backend       | 최인철        | [IncheolChoi](https://github.com/IncheolChoi)     |https://cic96.tistory.com/               |
| Backend       | 김유진        | [yujinkim0930](https://github.com/yujinkim09309)  |https://velog.io/@yujin3009              |

<br>

# ⚒ Tech Stack

<br>

|분류|기술|분류|기술|
| :-: | :-: | :-: | :-: |
|Runtime|Node.js|Language|TypeScript|
|Framework|Nest.js |DB|MySQL(AWS RDS)|
|Web Crawling|Axios, Cheerio , puppeteer|CI/CD|Docker, Github Action|
|DevOps| AWS EC2,Elastic Search,Elastic Beanstalk|Frontend|html,css,js|

 
<br>

#  📒 ERD



![image](https://github.com/ratempty/raffles/assets/138560050/65e1e1a3-8787-4324-8ec2-6d8a273fbbcc)


<br>

# 🕸 Architecture


![image](https://github.com/ratempty/raffles/assets/138560050/38428694-2910-4774-ac25-9385ea95d6aa)


  

<br>


# 📹 주요 기능별 영상
<details>
<summary> #1 응모기능 </summary>
<div markdown="1">




https://github.com/ratempty/raffles/assets/138560050/5d3149a5-e695-4c65-bbf9-93a2bde98070





</div>
</details>

<details>
<summary> #2 마켓기능 </summary>
<div markdown="1">



https://github.com/ratempty/raffles/assets/138560050/5aba45c6-170b-425b-823d-844db4610f57




</div>
</details>

<details>
<summary> #3 댓글기능 </summary>
<div markdown="1">




https://github.com/ratempty/raffles/assets/138560050/55213995-5e83-466d-9fab-ecac0db30f69





</div>
</details>

<details>
<summary> #4 뉴스 및 캘린더 </summary>
<div markdown="1">




https://github.com/ratempty/raffles/assets/138560050/108a9bf5-126a-483d-b76d-d465f4f28951





</div>
</details>

<details>
<summary> #5 검색기능 </summary>
<div markdown="1">




https://github.com/ratempty/raffles/assets/138560050/fa7a9f40-82a7-4987-9b9e-da7c702d7c77





</div>
</details>
<br>

# 💣 Troubleshooting

<details>
<summary> #1 SSL 적용 </summary>
   
    우리 서비스의 구조는 백서버와 프론트 서버가 달라 프론트만 https적용할 경우 cors에러 발생
    Elastic beanstalk 도메인도 구매한 도메인 연결 후 ssl 적용 해줌으로 cors에러는 해결이 가능했으나 EB에서는 ssl 인증서를 연결을 계속 못하는 에러가 발생했다.
    
    정확한 이유는 프론트를 s3웹 호스팅으로 서빙하다 보니 cloud front를 사용했는데 여기에는 글로벌로 적용 시키기 때문에 ssl도 유럽동부에서 작성했다. 
    이와 같이 eb에도 유럽동부의 ssl을 적용 시키려 하니 아예 선택이 불가했다. 
    
    ⇒ 해결방법 리전을 ec2가 설정된 리전과 같게 만드니 완성됐다.
</details>

<details>
<summary> #2 유저 api 리팩토링 </summary>
    
    다른 유저 api보다 로그아웃 api가 작동하지 않아서 코드를 보니 클라이언트에게 새로운 만료된 토큰을 전달하여 로그아웃을 유도하고, 새로운 토큰을 사용하여 인증 요청을 할 경우에만 로그아웃이 되도록 설정해놓은 로직이 제대로 작동하지 않았다. 
    
    해결방안 : Http쿠키를 사용하여 로그아웃하는 쪽으로 로직을 수정하고, 쿠키시간을 로그아웃 처리한 시점부터 바로 만료되도록 설정했습니다.
</details>

<details>
<summary> #3 github action을 활용한 자동 배포 </summary>

    github action을 활용하여 Beanstalk에 배포하는 과정에서 에러가 발생함. Beanstalk 로그를 확인한 결과 환경변수가 제대로 주입되지 않은 것을 확인함.
    
   ![image](https://github.com/ratempty/raffles/assets/138560050/7e72f994-8512-4da4-b2af-90644a2ff62d)

    
    yaml파일을 수정하여 환경변수를 주입하는 여러 가지 방법을 시도했지만 같은 에러가 발생함.
    
    yaml파일이 아닌 Beanstalk 환경 속성에 환경변수를 주입하지 않아서 생긴 문제였던 것을 확인함.
    
    Beanstalk 환경 속성에 필요한 환경 변수들을 추가하여 설정함.
    
    환경 변수 주입 후 github action으로 다시 배포를 진행하니 서버가 정상적으로 실행되는 것을 확인함.

</details>

<details>
<summary> #4 스크래핑이 원할하게 진행되지 않던 문제 </summary>

    - 퍼페티어를 이용해 스크래핑을 진행하면 동작 속도가 매우 오래걸리는 단점이 있는 문제 발생
    모든 스크래핑을 퍼페티어를 이용해 브라우저에 직접 접속하여 이동하고 동작하도록 함. ⇒ 브라우저로딩 시간을 기다리는 등의 이유로 성능의 한계를 느낌

        - 해결방안
        
        브라우저 로딩 속도를 기다려야하며 패키지가 무거워 악시오스로 스크래핑이 가능한 데이터는 악시오스로 스크래핑하되, 네트워크 패킷 분석을 통해 API를 찾아보아도 숨겨져 있는 경우엔 퍼페티어를 사용하기로 결정 cheerio와 병행하여 데이터 스크래핑을 진행


<br>

        
    - 네트워크 패킷분석으로 헤더 정보 확인 후 삽입
       
![image](https://github.com/ratempty/raffles/assets/138560050/bdd870f8-bfe4-46c3-9756-df85d3ec7dde)
    - 악시오스로 스크래핑 되지 않는 데이터 퍼페티어 활용
        
![image](https://github.com/ratempty/raffles/assets/138560050/a95bcfc0-b1dd-4954-94c1-825526ea54dd)

        
        
        

        
    - 성능 개선
        - 플랫폼 데이터 요청 api와 axios를 이용해 데이터 스크래핑
        

![image](https://github.com/ratempty/raffles/assets/138560050/a5a5da71-40ed-42a6-9bee-1af8277661fb)

        
        네트워크 탭을 열어 요청 url을 확인하고 페이로드와 헤더를 보며 axios를 통해 요청을 넣는다.
        
        - html api인 경우 cheerio를 병행해 데이터 스크래핑
        

![image](https://github.com/ratempty/raffles/assets/138560050/22c7f993-b5f0-4704-8aff-bd2bf7704a73)

        
        - 요청 api가 숨겨져있는 경우는 퍼페티어로 랭킹별 작품을 위주로 가져오고, 그 외는 api로 빠르게 데이터를 수집
        
        성능개선 결과
        
![image](https://github.com/ratempty/raffles/assets/138560050/3b5b7293-0704-4c1c-9b87-de481e127078)


        
        - 기존 퍼페티어만을 이용 
        ⇒ 20개 작품 데이터(각 리뷰 30개씩)를 가져오는데 2분
        - api 이용해 데이터를 가져오도록 개선 
        ⇒ 400개 작품 데이터(각 리뷰 10개씩)를 가져오는데 4분


</details>



<details>
<summary> #5 엘라스틱 서치 동의어 사전 추가 </summary>

<br>
   
aws elasticsearch에 raffles와 news 인덱스는 한글과 영어가 같이 존재하지만 
shoes 인덱스는 영어로만 이루어져 있어 한글로 검색이 통합되어 나오지  않는 문제가 발생.

이를 해결하기 위해 동의어 사전 매핑을 진행.

- 기존에 들어가 있는 index들이 존재하면 reinexing 해줘야하는 상황 발생
- 저장되어 있는 데이터를 전부 날리고 reindexing 후 매핑 설정
- 영어로 된 데이터만 있기 때문에 seunjeon 토크나이저를 사용하지 않음.
- 해결 방안
    
    s3 버킷에 동의어사전을 업로드 후 aws elasticsearch 패키지에 연결 시킨 후
    키바나로 매핑 세팅해주면서 한글 검색이 가능하게 해결
    
    위와 같이 해결 후 한글 데이터가 들어가 있는 raffles와 news index에는
  
  ![image](https://github.com/ratempty/raffles/assets/138560050/4a2a1cb9-4c81-4f5a-b99d-cac7dff653b1)
  
  ![image](https://github.com/ratempty/raffles/assets/138560050/ad8ebc02-fe87-40d0-ae5e-192811db00cb)
  
  seunjeon 토크나이저와 사용자 사전을 따로 적용 시킨 후 검색 성능 향상
  
![image](https://github.com/ratempty/raffles/assets/138560050/cdec7b43-0623-4618-ade0-13ac9cb4fd65)

위와 같이 해결 후 한글 데이터가 들어가 있는 raffles와 news index에는

</details>



<br><br>
# 📝Commit Convention

<details>
<summary> Commit Convention 펼쳐보기 </summary>
<div markdown="1">  
  <br>
제목은 최대 50글자가 넘지 않도록 하고 마침표 및 특수기호는 사용하지 않는다.

 
영문으로 표기하는 경우 동사(원형)를 가장 앞에 두고 첫 글자는 대문자로 표기한다.(과거 시제를 사용하지 않는다.)
 
제목은 **개조식 구문**으로 작성한다. --> 완전한 서술형 문장이 아니라, 간결하고 요점적인 서술을 의미.

<br><br>

> **타입은 태그와 제목으로 구성되고, 태그는 영어로 쓰되 첫 문자는 대문자로 한다.**
> 
> 
> **`태그 : 제목`의 형태이며, `:`뒤에만 space가 있음**
> 
- `Feat` : 새로운 기능 추가
- `Fix` : 버그 수정
- `Docs` : 문서 수정
- `Style` : 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `Refactor` : 코드 리펙토링
- `Test` : 테스트 코드, 리펙토링 테스트 코드 추가
- `Chore` : 빌드 업무 수정, 패키지 매니저 수정
</div>
</details>

<br><br>

# 🗒️Code Convention

<details>
<summary> Code Convention 펼쳐보기 </summary>
<div markdown="1">  
  <br>

{<br>
  "trailingComma": "all",<br>
  "tabWidth": 2,<br>
  "semi": true,<br>
  "singleQuote": true<br>
}

 
</div>
</details>
<br><br><br>


![header](https://capsule-render.vercel.app/api?type=waving&color=auto&height=200&section=header&text=Thank%20you%20for%20watching&fontSize=50)

















