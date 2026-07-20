import { useEffect } from 'react'
import type { Locale } from '../i18n'

type Translations = [english: string, japanese: string, chinese: string]

const copy: Record<string, Translations> = {
  '머무는 순간까지': ['Every stay becomes', '滞在する瞬間まで', '让每次停留'],
  '여행이 되도록': ['part of the journey', '旅になるように', '都成为旅程'],
  '도시의 설렘부터 자연 속 여유까지, 지금 나에게 맞는 공간을 발견하세요.': ['From city excitement to nature’s calm, find a space that fits you.', '街の高揚感から自然の安らぎまで、今のあなたに合う空間を見つけてください。', '从城市的心动到自然的闲适，发现此刻适合你的空间。'],
  '추천 숙소 둘러보기': ['Explore recommended stays', 'おすすめの宿を見る', '查看推荐住宿'],
  '내 공간 호스팅하기': ['Host my space', '自分の空間をホスティング', '发布我的空间'],
  '엄선된 숙소': ['Curated stays', '厳選された宿', '精选住宿'],
  '게스트 만족도': ['Guest satisfaction', 'ゲスト満足度', '房客满意度'],
  '여행 지원': ['Travel support', '旅行サポート', '旅行支持'],
  '어디로 떠나볼까요?': ['Where will you go?', 'どこへ行きますか？', '想去哪里？'],
  '지금 인기 있는 여행지': ['Popular destinations now', '今人気の旅行先', '当前热门目的地'],
  'TripFlow 여행자들이 이번 주 가장 많이 찾은 지역이에요.': ['The places TripFlow travelers searched most this week.', '今週TripFlow旅行者が最も検索した地域です。', 'TripFlow旅行者本周搜索最多的地区。'],
  '취향으로 고른 공간': ['Spaces picked for you', '好みで選ぶ空間', '按喜好精选空间'],
  '이번 주 추천 숙소': ['Recommended stays this week', '今週のおすすめ宿', '本周推荐住宿'],
  '전체 보기': ['View all', 'すべて見る', '查看全部'],
  '나답게 머무는 방법': ['Stay your way', '自分らしい滞在', '以自己的方式入住'],
  '여행 스타일로 찾아보세요': ['Explore by travel style', '旅のスタイルで探す', '按旅行风格探索'],
  '당신의 공간이 누군가의 여행이 됩니다': ['Your space becomes someone’s journey', 'あなたの空間が誰かの旅になります', '你的空间会成为别人的旅程'],
  '간단한 호스트 등록으로 공간의 새로운 가능성을 시작해 보세요.': ['Start a new possibility for your space with simple host registration.', '簡単なホスト登録で空間の新しい可能性を始めましょう。', '通过简单的房东注册，开启空间的新可能。'],
  '호스트 되기': ['Become a host', 'ホストになる', '成为房东'],
  '서울': ['Seoul', 'ソウル', '首尔'], '부산': ['Busan', '釜山', '釜山'], '제주': ['Jeju', '済州', '济州'], '강릉': ['Gangneung', '江陵', '江陵'],
  '도심 속 감각적인 하루': ['A stylish day in the city', '都心で過ごす洗練された一日', '都市中的精致一天'],
  '파도 가까이 머무는 여행': ['Stay close to the waves', '波のそばに滞在する旅', '住在海浪旁的旅行'],
  '천천히 쉬어가는 섬': ['An island to slow down', 'ゆっくり休む島', '慢下来休息的岛屿'],
  '바다와 숲 사이의 휴식': ['Rest between sea and forest', '海と森の間で休む', '在海与森林间休息'],
  '마이페이지': ['My page', 'マイページ', '我的主页'],
  '내 계정 정보를 확인하고 호스트 활동을 시작할 수 있어요.': ['Review your account and start hosting.', 'アカウント情報を確認してホスト活動を始められます。', '查看账户信息并开始房东活动。'],
  '사용자 기본 정보': ['Basic profile', 'ユーザー基本情報', '用户基本信息'],
  'TripFlow에 등록된 계정 정보입니다.': ['Your registered TripFlow account information.', 'TripFlowに登録されたアカウント情報です。', '这是您在TripFlow注册的账户信息。'],
  '이름': ['Name', '名前', '姓名'], '이메일': ['Email', 'メール', '电子邮箱'],
  '호스트가 되어보세요': ['Become a host', 'ホストになりませんか', '成为房东'],
  '나만의 공간을 여행자에게 소개할 준비를 시작해 보세요.': ['Get ready to introduce your space to travelers.', 'あなたの空間を旅行者に紹介する準備を始めましょう。', '开始准备向旅行者介绍你的空间。'],
  '마이페이지로 돌아가기': ['Back to My Page', 'マイページに戻る', '返回我的主页'],
  '호스트 등록': ['Host registration', 'ホスト登録', '房东注册'],
  '사업자 정보를 입력하고 TripFlow 호스트 등록을 신청해 주세요.': ['Enter your business information to apply as a TripFlow host.', '事業者情報を入力してTripFlowホスト登録を申請してください。', '请输入企业信息并申请成为TripFlow房东。'],
  '사업자 정보': ['Business information', '事業者情報', '企业信息'],
  '사업장 주소': ['Business address', '事業所住所', '营业地址'],
  '호스트 소개': ['Host introduction', 'ホスト紹介', '房东介绍'],
  '상호명': ['Business name', '商号', '商号'], '대표자명': ['Representative', '代表者名', '法人代表'],
  '사업자등록번호': ['Business registration number', '事業者登録番号', '营业执照号码'],
  '우편번호': ['Postal code', '郵便番号', '邮政编码'], '도로명 주소': ['Road address', '道路名住所', '道路地址'],
  '상세 주소': ['Address details', '詳細住所', '详细地址'], '소개': ['Introduction', '紹介', '介绍'],
  '필수': ['Required', '必須', '必填'], '선택': ['Optional', '任意', '选填'],
  '주소 검색': ['Search address', '住所検索', '搜索地址'], '주소 검색 중...': ['Searching...', '住所を検索中...', '正在搜索...'],
  '등록 신청 동의': ['Application consent', '登録申請への同意', '注册申请同意'],
  '호스트 운영 정책 동의': ['Agree to host policy', 'ホスト運営ポリシーに同意', '同意房东运营政策'],
  '개인정보 수집 및 이용 동의': ['Agree to personal data collection and use', '個人情報の収集・利用に同意', '同意收集及使用个人信息'],
  '입력한 정보가 사실임을 확인': ['Confirm the information is accurate', '入力情報が事実であることを確認', '确认所填信息属实'],
  '호스트 등록 신청': ['Apply for host registration', 'ホスト登録を申請', '申请房东注册'],
  '로그인': ['Log in', 'ログイン', '登录'], '회원가입': ['Sign up', '会員登録', '注册'],
  '비밀번호': ['Password', 'パスワード', '密码'], '비밀번호 확인': ['Confirm password', 'パスワード確認', '确认密码'],
  '전화번호': ['Phone number', '電話番号', '电话号码'], '이름 또는 닉네임': ['Name or nickname', '名前またはニックネーム', '姓名或昵称'],
  '확인': ['Confirm', '確認', '确认'], '로그인하기': ['Log in', 'ログインする', '登录'], '홈으로 이동': ['Go home', 'ホームへ移動', '返回首页'],
  '아이디 찾기': ['Find ID', 'IDを探す', '找回账号'], '비밀번호 찾기': ['Find password', 'パスワードを探す', '找回密码'],
  '또는': ['or', 'または', '或'], '로그인 중...': ['Logging in...', 'ログイン中...', '正在登录...'],
  '회원가입 처리 중...': ['Signing up...', '登録処理中...', '正在注册...'],
  '아직 회원이 아니신가요?': ['Not a member yet?', 'まだ会員ではありませんか？', '还不是会员？'],
  '이미 계정이 있으신가요?': ['Already have an account?', 'すでにアカウントをお持ちですか？', '已有账户？'],
  '이메일을 입력해 주세요': ['Enter your email', 'メールを入力してください', '请输入电子邮箱'],
  '비밀번호를 입력해 주세요': ['Enter your password', 'パスワードを入力してください', '请输入密码'],
  '이름 또는 닉네임을 입력해 주세요': ['Enter a name or nickname', '名前またはニックネームを入力してください', '请输入姓名或昵称'],
  '비밀번호를 다시 입력해 주세요': ['Enter your password again', 'パスワードを再入力してください', '请再次输入密码'],
  '전화번호를 입력해 주세요': ['Enter your phone number', '電話番号を入力してください', '请输入电话号码'],
  '남산을 품은 모던 한옥': ['Modern hanok by Namsan', '南山を望むモダン韓屋', '南山现代韩屋'],
  '파노라마 오션 스테이': ['Panorama ocean stay', 'パノラマオーシャンステイ', '全景海景住宿'],
  '오름 아래 고요한 돌집': ['Quiet stone house below the oreum', 'オルムの麓の静かな石の家', '山丘下安静的石屋'],
  '안개 숲 프라이빗 캐빈': ['Private cabin in the misty forest', '霧の森のプライベートキャビン', '雾林私人小屋'],
  '게스트 선호': ['Guest favorite', 'ゲストのお気に入り', '房客之选'], '오션뷰': ['Ocean view', 'オーシャンビュー', '海景'],
  '한적한 휴식': ['Peaceful retreat', '静かな休息', '静谧休憩'], '신규 오픈': ['New', '新規オープン', '新开业'],
  '햇살 좋은 오션뷰': ['Sunny ocean views', '日差しの良いオーシャンビュー', '阳光海景'],
  '감성적인 한옥': ['Atmospheric hanok', '趣のある韓屋', '氛围韩屋'], '온전한 쉼': ['Complete relaxation', '心からの休息', '彻底放松'],
  '창문 너머로 바다가 펼쳐지는 숙소': ['Stays with the sea beyond your window', '窓の向こうに海が広がる宿', '窗外就是大海的住宿'],
  '오늘의 감각으로 다시 만나는 전통 공간': ['Traditional spaces reimagined for today', '現代の感性で再会する伝統空間', '以现代美感重塑传统空间'],
  '스파와 자쿠지가 있는 프라이빗 스테이': ['Private stays with spas and jacuzzis', 'スパとジャグジー付きのプライベートステイ', '配有水疗和按摩浴缸的私人住宿'],
  '사업자등록증에 기재된 정보와 동일하게 입력해 주세요.': ['Enter the information exactly as shown on your business certificate.', '事業者登録証と同じ情報を入力してください。', '请填写与营业执照一致的信息。'],
  '주소 검색을 통해 사업장 소재지를 입력해 주세요.': ['Search for your business location.', '住所検索で事業所所在地を入力してください。', '请通过地址搜索填写营业地点。'],
  '게스트에게 보여줄 호스트 소개를 작성해 주세요.': ['Write an introduction guests will see.', 'ゲストに表示するホスト紹介を作成してください。', '请填写向房客展示的房东介绍。'],
  '상호명을 입력해 주세요': ['Enter the business name', '商号を入力してください', '请输入商号'],
  '대표자명을 입력해 주세요': ['Enter the representative’s name', '代表者名を入力してください', '请输入法人代表姓名'],
  '주소 검색을 이용해 주세요': ['Use address search', '住所検索を利用してください', '请使用地址搜索'],
  '상세 주소를 입력해 주세요': ['Enter address details', '詳細住所を入力してください', '请输入详细地址'],
  '호스트와 공간에 대해 간단히 소개해 주세요': ['Briefly introduce yourself and your space', 'ホストと空間を簡単に紹介してください', '请简单介绍房东和空间'],
  '하이픈은 자동으로 입력됩니다.': ['Hyphens are added automatically.', 'ハイフンは自動入力されます。', '连字符会自动输入。'],
  '숫자 10자리를 입력해 주세요.': ['Enter 10 digits.', '数字10桁を入力してください。', '请输入10位数字。'],
  '이메일로 로그인하거나 소셜 계정으로 계속하세요.': ['Log in with email or continue with a social account.', 'メールでログインするか、ソーシャルアカウントで続行してください。', '使用邮箱登录或通过社交账户继续。'],
  '이메일 또는 소셜 계정으로 가입하세요.': ['Sign up with email or a social account.', 'メールまたはソーシャルアカウントで登録してください。', '使用邮箱或社交账户注册。'],
  '로그인이 완료되었습니다.': ['Login complete.', 'ログインが完了しました。', '登录成功。'],
  '회원가입이 완료되었습니다': ['Sign-up complete', '会員登録が完了しました', '注册成功'],
  'TripFlow에 오신 것을 환영합니다.': ['Welcome to TripFlow.', 'TripFlowへようこそ。', '欢迎来到TripFlow。'],
  'TripFlow와 함께 새로운 여행을 시작해보세요.': ['Start a new journey with TripFlow.', 'TripFlowと新しい旅を始めましょう。', '与TripFlow开启新的旅程。'],
  'TripFlow 이용약관 및 개인정보 처리방침에 동의합니다.': ['I agree to the TripFlow Terms and Privacy Policy.', 'TripFlow利用規約およびプライバシーポリシーに同意します。', '我同意TripFlow条款和隐私政策。'],
  '올바른 이메일 형식을 입력해 주세요.': ['Enter a valid email address.', '正しいメール形式を入力してください。', '请输入有效的电子邮箱。'],
  '비밀번호가 일치하지 않습니다.': ['Passwords do not match.', 'パスワードが一致しません。', '密码不一致。'],
  '이미 사용 중인 이메일입니다.': ['This email is already in use.', 'このメールはすでに使用されています。', '该邮箱已被使用。'],
  '사용 가능한 이메일입니다.': ['This email is available.', '使用可能なメールです。', '该邮箱可用。'],
  '이메일을 확인하고 있습니다.': ['Checking email...', 'メールを確認中です。', '正在检查邮箱...'],
}

const originals = new WeakMap<Text, string>()
const attributeOriginals = new WeakMap<Element, Map<string, string>>()
const attributes = ['placeholder', 'aria-label', 'title']

const translated = (value: string, locale: Locale) => {
  if (locale === 'ko') return value
  const entry = copy[value]
  return entry?.[{ en: 0, ja: 1, zh: 2 }[locale]] ?? value
}

export function useDocumentTranslation(locale: Locale) {
  useEffect(() => {
    const apply = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode() as Text | null
      while (node) {
        if (node.parentElement?.closest('.site-header')) {
          node = walker.nextNode() as Text | null
          continue
        }
        const original = originals.get(node) ?? node.data
        originals.set(node, original)
        const trimmed = original.trim()
        if (trimmed) node.data = original.replace(trimmed, translated(trimmed, locale))
        node = walker.nextNode() as Text | null
      }

      const elements = root instanceof Element ? [root, ...root.querySelectorAll('*')] : []
      elements.forEach((element) => {
        if (element.closest('.site-header')) return
        const stored = attributeOriginals.get(element) ?? new Map<string, string>()
        attributes.forEach((attribute) => {
          const current = element.getAttribute(attribute)
          if (current !== null && !stored.has(attribute)) stored.set(attribute, current)
          const original = stored.get(attribute)
          if (original) element.setAttribute(attribute, translated(original, locale))
        })
        attributeOriginals.set(element, stored)
      })
    }

    apply(document.body)
    const observer = new MutationObserver((mutations) => {
      observer.disconnect()
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') originals.delete(mutation.target as Text)
        apply(mutation.target)
        mutation.addedNodes.forEach(apply)
      })
      observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [locale])
}
