# lerna-monorepo-example
lerna-monorepo-example

1 lerna 설치

```bash
npm install -g lerna
```

2. lerna repository init
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
  ]
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

6. Root경로 공통 종속성 설치
루트 경로의 모듈은 yarn 으로 설치
```bash
yarn add eslint --dev --ignore-worksapce-root-check

```

7. 각 패키지 모듈 설치
각 패키지에 모듈을 설치할 때에는 공통 모듈을 설치하는 것과는 다르게 lerna add를 통해서 각 패키지에 설치 할 수 있다. 이 과정에서 hoisting이 일어나고 종속성을 최적화시킨다.
lerna add를 사용할 때는 --scope 옵션을 통해서 어느 패키지에 설치할 것인가를 명시해준다. --scope를 주지 않을 경우 모든 패키지에 설치된다.
```bash
lerna add commander --scope=log-cli
```
log-cli 에 commander 노드 모듈이 설치되지 않고 package.json에만 추가되어 있고 모듈은 루트에 설치되어 있음
lerna가 종속성 관리를 해준 거임


##
참고 : https://kdydesign.github.io/2020/08/27/mono-repo-lerna-example/