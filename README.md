# lerna-monorepo-example
lerna-monorepo-example

lerna
- 패키지 별 버전관리
- 패키지 별 배포
- npm scripts 실행 (패키지 전체 대상 혹은 특정 패키지만)

yarn workspace
- 패키지 간 의존성 설치 및 관리(symlink)


1. lerna 설치

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
  "useWorkspaces": true, //yarn workspace 사용 패키지 관리를 yarn으로
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
  "name" : "lerna-example",
  "private": true, //Root가 NPM Repository로 배포 방지
  "workspaces": [
    "packages/*"
  ],
  "nohoist": ["**/react-native"], //호이스팅을 하지 않을 모듈 설정
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
Root 경로에 모든 패키지가 공통으로 사용될 모듈을 설치  
lerna add라는 명령어를 사용할 수도 있지만 lerna add는 패키지 간 종속성 설치 시 사용하는 걸 추천  
그냥 lerna add를 사용한다 하더라도 모듈은 Root 경로에 설치되겠지만 각 패키지에 dependencies가 걸리게 되어있다. 그렇기 때문에 Root 경로의 공통 모듈을 npm또는 yarn을 통하여 설치하자.

```bash
yarn add eslint --dev --ignore-worksapce-root-check
```
yarn을 통해 eslint를 설치하기 위해서는 workspace를 지정하였기 때문에 일반 add를 통해서는 설치가 불가능하다.  
그렇기 때문에 --ignore-worksapce-root-check 옵션을 지정
설치 후 Root 경로의 package.json을 보면 devDependencies에 eslint가 설치된 것을 확인


7. 각 패키지 모듈 추가
각 패키지에 모듈을 설치할 때에는 공통 모듈을 설치하는 것과는 다르게 lerna add를 통해서 각 패키지에 설치 할 수 있다. 이 과정에서 hoisting이 일어나고 종속성을 최적화시킨다.  
lerna add를 사용할 때는 --scope 옵션을 통해서 어느 패키지에 설치할 것인가를 명시해준다. --scope를 주지 않을 경우 모든 패키지에 설치된다.
```bash
lerna add commander --scope=log-cli // commander라는 모듈을 log-cli 패키지에 추가
lerna add chalk --scope=log-core // chalk라는 모듈을 log-core 패키지에 추가
```
log-cli 에 commander 노드 모듈이 설치되지 않고 package.json에만 추가되어 있고 모듈은 루트에 설치되어 있음 lerna가 종속성 관리를 해준 거임  
하지만 lerna로 패키지를 관리하면 이슈가 생길 가능성이 있기 떄문에 yarn workspace로 패키지를 설치하도록 하자.

moon과 sun패키지는 sky패키지를 사용  
의존성 추가를 하기 위해서 moon과 sun에서 다음과 같이 yarn 커맨드로 sky 패키지를 사용하자.  
```bash
package.json
packages/
sky
moon
sun

yarn workspace @monorepo/moon add @monorepo/sky@0.0.0 // moon패키지에 sky패키지를 추가
yarn workspace @monorepo/sun add @monorepo/sky@0.0.0 // sun패키지에 sky패키지를 추가
```

원본 파일인 sky패키지가 수정되면 moon에서는 수정된 버전의 sky를 가져다 쓰게 된다. 서로 심볼릭 링크로 연결되어 있기 때문이다.  
각 npm패키지를 배포하지 않더라도 로컬 컴퓨터에서 서로 의존하고 있는 패키지들을 쉽게 수정하고 확인하고 테스트해볼수있다.  
이렇게 의존성을 설치해주고 나서는 그냥 평소에 import하던것처럼 하면 된다.  
여기서 주의할것은 마지막에 @0.0.0과 같이 버전 정보를 정확히 적어줘야 설치가 제대로 된다는것이다. 버전을 명시하지 않으면 yarn은 npm 레포지토리에서 패키지를 찾게 된다.  
로컬은 찾아보지도 않고 에러를 내버린다.  


8. 각 패키지 기능 추가
log-core.js 수정
```javascript
//chalk를 사용하여 console.log를 출력해 주는 코드를 작성
const { red } = require('chalk')

function core () {
  console.log(red('❤  Running Core !!!!!'))
}
module.exports = core
```

log-cli.js 수정
```javascript
#!/usr/bin/env node
// commander와 log-core를 추가하고 commander를 통해 command를 입력받으면 log-core를 수행
const { program } = require('commander')
const LogCore = require('log-core')

// action
program.action(cmd => LogCore())

program.parse(process.argv)
```
log-cli/package.json 수정

```json
{
  "name": "log-cli",
  "version": "1.0.0",
  "description": "log-cli-example",
  "author": "Your name",
  "license": "MIT",
  "bin": { //bin 속성을 추가하여 CLI가 가능하게 수정
    "log-cli": "lib/log-cli.js"
  },
  "files": [
    "lib"
  ],
  "dependencies": {
    "commander": "^6.0.0"
  }
}
```

9. 로컬 테스트
```bash
npm link packages/log-cli // npm link를 통하여 global로 symbolic link를 생성
log-cli // 전역 어디서든 실행 가능
```

10. 패키지 내 참조 및 설치
로컬에서 실행하면 정상적으로 동작된다. 로컬에서는 log-cli와 log-core 연관 관계를 인지하고 있기 때문이다.  
실제로 패키지를 배포 후 배포된 패키지를 설치하여 실행한다면 패키지를 찾지 못함  
log-cli에서 log-core를 삽입하였는데 실제로 log-cli에는 log-core가 종속되지 않았기 때문에 발생한다.  
이를 해결하기 위해서는 lerna add를 통해서 log-cli에 log-core를 설치해 해줘야 한다.

```bash
lerna add log-core --scope=log-cli

Or

yarn workspace log-cli add log-core
```

그렇게 하면 log-cli package.json dependencies에 log-core가 추가됨

```json
"dependencies": {
    "commander": "^6.0.0",
    "log-core": "^1.0.0"
  }
```


11. 각각 패키지 모듈 인스톨  
```bash
lerna bootstrap --hoist
OR
yarn
```
각각 폴더에 npm install 수행  
이때 공통된 module 들은 root 의 node_modules 에 install 하고 각 package 들에 연결된다. 만약 각 package 별로 버전이 다를 경우, warning 메시지를 띄우고, package 의 node_modules 에 install 된다.  
각 패키지별로 버전이 다른경우를 체크할 수 있으며, 하나의 버전으로 모을 수 있다.

yarn만 입력해주면, 각 패키지의 모듈을 모아서 루트에 딱 한번만 설치하고, 서로 의존하는 로컬 패키지들은 심볼릭 링크를 통해 연결된다.  
yarn workspace의 yarn install은 lerna bootstrap --hoist 명령과 똑같이 동작한다.  
하지만 패키지별 버전관리와 배포, npm scripts 실행등은 아직 yarn에서 제공하지 못하기 때문에 이 부분은 lerna가 해줘야한다.

12. 모든 모듈 삭제
```bash
lerna clean
```

13. dev dependencies Root로 통합  
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

14. run
```bash
lerna run [--scope package-1] [script]
```
해당 script를 포함하는 각 패키지에 해당 npm script를 실행합니다.  
또는 --scope package-1 로 해당 패키지의 script를 실행한다.  
예를 들어 각 프로젝트에 test관련 script가 존재한다면, 루트 디렉토리에서 lerna run test 커맨드로 모든 프로젝트의 테스트 코드를 실행할 수 있습니다.


15. import
```bash
lerna import <pathToRepo>
```
로컬에 위치하는 <pathToRepo>에 해당하는 패키지를 커밋 히스토리와 함께 packages/<directory-name>으로 import합니다.  


16. publish
```bash
lerna publish
```
업데이트된 패키지의 새로운 배포를 생성합니다. 새 버전으로 올리고 git과 npm에서 모든 패키지를 업데이트합니다.

17. changed
```bash
lerna changed
```
지난 배포 이후 어떤 패키지에 변화가 있었는 지 확인합니다.

18. diff
lerna diff [package?]
지난 배포 이후 개별 혹은 모든 패키지의 diff를 보여줍니다.

19. 의존성 추가



##
참고 : https://github.com/wecanooo/react-native-web-mono-repo [react web & native 모노레포 프로젝트]  
참고 : https://medium.com/reactbrasil/reuse-your-eslint-prettier-config-in-a-monorepo-with-lerna-54c1800cacdc  
참고 : https://kdydesign.github.io/2020/08/27/mono-repo-lerna-example/  
참고 : https://geonlee.tistory.com/215 [빠리의 택시 운전사]  
참고 : https://simsimjae.tistory.com/384 [104%]  
참고 : https://so-so.dev/pattern/mono-repo-config/  
참고 : https://pks2974.medium.com/mono-repo-%EB%A5%BC-%EC%9C%84%ED%95%9C-lerna-%EA%B0%84%EB%8B%A8-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0-65c22029988  
참고 : https://chaewonkong.github.io/posts/lerna-react-typescript.html  
참고 : https://rokt33r.github.io/posts/monorepo-and-lerna  




## react-native lerna 설정

#### 0. 사전설치
* NodeJS v14.8.0이상
* yarn
```
npm i -g yarn
```
* lerna
```bash
npm install -g lerna
```
* Android - Android Studio(With SDK, NDK)
* iOS - XCode

#### 1. 프로젝트 생성
```bash
./project
    /packages
        /pacakge1
        /package2
```

```bash
mkdir [project]
cd [project]
yarn init -y -p
npx lerna init
```

#### 2. lerna.json 설정 
```json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "packages": [
    "packages/*"
  ]
}
```

#### 3. package.json 설정 
```json
{
  "name": "safesea-mas-app-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": {
    "packages" : [
        "packages/*"
    ],
    "nohoist:": []
  },
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "clean": "rm -rf node_modules && lerna clean --yes && yarn cache clean && yarn"
  },
  "devDependencies": {
    "lerna": "^3.22.1",
    "react-native": "*"
  }
}

```

### 4. RN 프로젝트 생성

```bash
cd packages
npx react-native init [RN-ProjectName] --template react-native-template-typescript
cd [RN-ProjectName]
rm yarn.lock && rm -rf node_modules && rm -rf .git
```

### 4. RN 프로젝트 metro.config 설정
If you add a dependency to the workspace root, it will have no choice but to be at the top, so what I like to do to make sure React Native will have a consistent path in my node_modules is adding it to the top-level package.json. (Using “*” as the version number aligns it to the one in your packages).

Open packages/mobile/metro.config.js and set the projectRoot to the monorepo root.

```javascript
// metro.config.js 경로 수정

const path = require('path');

module.exports = {
  projectRoot: path.resolve(__dirname, '../../'),
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
```

### 5. RN 프로젝트 iOS 설정 - 경로 설정
ios 엑스코드 실행
```bash
$ open packages/safesea_msd_app/ios/myproject.xcodeproj/
```
AppDelegate.m 파일 열고  
jsBundleURLForBundleRoot:@"index" 부분 검색해서  
index 부분을 packages/safesea_msd_app/index 로 변경  

좌측에 프로젝트 이름 클릭하고  
오른쪽 Build Phases > Bundle React Native code and Images  
안에 내용 아래와 같이 변경  
export NODE_BINARY=node  
export EXTRA_PACKAGER_ARGS="--entry-file packages/safesea_msd_app/index.js"  
../../../node_modules/react-native/scripts/react-native-xcode.sh  

Podfile 수정

```swift
require_relative '../../../node_modules/react-native/scripts/react_native_pods'
require_relative '../../../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '10.0'

target 'myproject' do
  use_react_native!(path: '../../../node_modules/react-native')

  target 'myprojectTests' do
    inherit! :complete
    # Pods for testing
  end

  # Enables Flipper.
  #
  # Note that if you have use_frameworks! enabled, Flipper will not work and
  # you should disable these next few lines.
  use_flipper!
  post_install do |installer|
    flipper_post_install(installer)
  end
end

target 'myproject-tvOS' do
  # Pods for myproject-tvOS

  target 'myproject-tvOSTests' do
    inherit! :search_paths
    # Pods for testing
  end
end
```

### 6. RN 프로젝트 Android 설정 - 경로 설정
Open packages/safesea_msd_app/android/app/src/main/java/com/myproject/MainApplication.java  
getJSMainModuleName 검색  
"index" 부분 "packages/safesea_msd_app/index" 로 변경  

Open packages/safesea_msd_app/android/app/build.gradle
project.ext.react =  검색
아래 처럼 수정
```gradle
// 경로 변경
project.ext.react = [
    enableHermes: false,  // clean and rebuild if changing
    cliPath: "../../node_modules/react-native/local-cli/cli.js",
    entryFile: "packages/safesea_msd_app/index.js",
]

// 경로 변경
apply from: "../../../../node_modules/react-native/react.gradle"

// 경로 변경
if (enableHermes) {
        def hermesPath = "../../../../node_modules/hermes-engine/android/";
        debugImplementation files(hermesPath + "hermes-debug.aar")
        releaseImplementation files(hermesPath + "hermes-release.aar")
    } else {
        implementation jscFlavor
    }

// 경로 변경
apply from: file("../../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
```



Open packages/safesea_msd_app/android/settings.gradle
node_modules 경로 수정
```gradle
rootProject.name = 'safesea_msd_app'
apply from: file("../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
include ':app'
```

Open packages/safesea_msd_app/android/build.gradle
node_modules 경로 수정
```gradle
allprojects {
    repositories {
        mavenLocal()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url("$rootDir/../../../node_modules/react-native/android")
        }
        maven {
            // Android JSC is installed from npm
            url("$rootDir/../../../node_modules/jsc-android/dist")
        }

        google()
        jcenter()
        maven { url 'https://www.jitpack.io' }
    }
}
```



