# lerna-monorepo-example
lerna-monorepo-example

1 lerna 설치

```bash
npm install -g lerna
```

2. lerna repository init
새로운 lerna 저장소를 생성하거나 현재 저장소를 새로운 lerna 버전으로 업데이트합니다.
```bash
lerna init --independent // or -i
```

3. Root/lerna.json

```json
{
  "version": "independent", //패키지별 버전을 독립적으로 관리, Fixed Mode는 버전을 통합하여 관리
  "npmClient": "yarn", //npmclient를 yarn으
  "useWorkspaces": true, //yarn workspace 사용
  "packages": [
    "packages/*" //패키지 경로
  ],
  "bootstrap": {
    "ignore": "bootstrap 제외" ,
    "npmClientArgs": [ "npm install 명령 인자" ]
  }
}
```

4. Root/package.json

```json
{
  "private": true, //Root가 NPM Repository로 배포 방지
  "workspaces": [
    "packages/*"
  ],
  //공통된 node module들의 devDependencies 정의
  "devDependencies": {
    "lerna": "^3.20.2"
  }
}
```

5. 패키지 생성

```bash
lerna create [PACKAGE_NAME]
```

6. Root경로 공통 종속성 추가
루트 경로의 모듈은 yarn 으로 추가
```bash
yarn add eslint --dev --ignore-worksapce-root-check

```

7. 각 패키지 모듈 추가
각 패키지에 모듈을 설치할 때에는 공통 모듈을 설치하는 것과는 다르게 lerna add를 통해서 각 패키지에 설치 할 수 있다. 이 과정에서 hoisting이 일어나고 종속성을 최적화시킨다.
lerna add를 사용할 때는 --scope 옵션을 통해서 어느 패키지에 설치할 것인가를 명시해준다. --scope를 주지 않을 경우 모든 패키지에 설치된다.
```bash
lerna add commander --scope=log-cli
```
log-cli 에 commander 노드 모듈이 설치되지 않고 package.json에만 추가되어 있고 모듈은 루트에 설치되어 있음
lerna가 종속성 관리를 해준 거임

8. 각각 패키지 모듈 인스톨
각각 폴더에 npm install 수행
이때 공통된 module 들은 root 의 node_modules 에 install 하고 각 package 들에 연결된다. 만약 각 package 별로 버전이 다를 경우, warning 메시지를 띄우고, package 의 node_modules 에 install 된다.
각 패키지별로 버전이 다른경우를 체크할 수 있으며, 하나의 버전으로 모을 수 있다.
```bash
lerna bootstrap --hoist
```

9. 모든 모듈 삭제
```bash
lerna clean
```

10. dev dependencies Root로 통합
모든 package 에 설정된 devDependencies 을 root devDependencies 으로 옮긴다.
그리고, dependencies 에 package 를 file:packages/package-1 형태로 연결한다.
```bash
lerna link convert
```

```json
"dependencies": {
 "package-1": "file:packages/package-1",
 "package-2": "file:packages/package-2",
}
```
이때 각 package 들의 devDependencies 은 모두 root 으로 이동해버렸기 때문에, package 에서 devDependencies 를 실행하면, 예를 들어 webpack 을 실행하면, 작동하지 않는다.
이경우 root 에서 lerna run --scope package-1 start 로 실행하면 root 에 있는 devDependencies 를 참조할 수 있게 된다.
여기에서 lerna run 명령어는 package.json 에 있는 script 를 실행시킨다. — scope 으로 package 를 선택할 수 있다.

11. run
```bash
lerna run [--scope package-1] [script]
```
해당 script를 포함하는 각 패키지에 해당 npm script를 실행합니다.  
또는 --scope package-1 로 해당 패키지의 script를 실행한다.
예를 들어 각 프로젝트에 test관련 script가 존재한다면, 루트 디렉토리에서 lerna run test 커맨드로 모든 프로젝트의 테스트 코드를 실행할 수 있습니다.


12. import
```bash
lerna import <pathToRepo>
```
로컬에 위치하는 <pathToRepo>에 해당하는 패키지를 커밋 히스토리와 함께 packages/<directory-name>으로 import합니다.


13. publish
```bash
lerna publish
```
업데이트된 패키지의 새로운 배포를 생성합니다. 새 버전으로 올리고 git과 npm에서 모든 패키지를 업데이트합니다.

14. changed
```bash
lerna changed
```
지난 배포 이후 어떤 패키지에 변화가 있었는 지 확인합니다.

15. diff
lerna diff [package?]
지난 배포 이후 개별 혹은 모든 패키지의 diff를 보여줍니다.






##
참고 : https://kdydesign.github.io/2020/08/27/mono-repo-lerna-example/
      https://geonlee.tistory.com/215 [빠리의 택시 운전사]