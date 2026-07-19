export type Locale = 'ko' | 'en' | 'ja' | 'zh'

export const localeTags: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
}

export const headerMessages = {
  ko: {
    mainMenu: '주요 메뉴', openMenu: '메뉴 열기', closeMenu: '메뉴 닫기',
    accommodationSearch: '숙소 검색', destination: '여행지', destinationSearch: '여행지 검색', search: '검색',
    userMenu: '사용자 메뉴', myPage: '마이페이지', reservations: '예약 내역', wishlist: '찜한 숙소', trips: '여행 일정', logout: '로그아웃',
    auth: '로그인 또는 회원가입', language: '언어 선택', lightMode: '라이트 모드로 전환', darkMode: '다크 모드로 전환',
  },
  en: {
    mainMenu: 'Main menu', openMenu: 'Open menu', closeMenu: 'Close menu',
    accommodationSearch: 'Search stays', destination: 'Destination', destinationSearch: 'Search destinations', search: 'Search',
    userMenu: 'User menu', myPage: 'My page', reservations: 'Reservations', wishlist: 'Wishlist', trips: 'Trips', logout: 'Log out',
    auth: 'Log in or sign up', language: 'Select language', lightMode: 'Switch to light mode', darkMode: 'Switch to dark mode',
  },
  ja: {
    mainMenu: 'メインメニュー', openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる',
    accommodationSearch: '宿泊先を検索', destination: '目的地', destinationSearch: '目的地を検索', search: '検索',
    userMenu: 'ユーザーメニュー', myPage: 'マイページ', reservations: '予約履歴', wishlist: 'お気に入り', trips: '旅行日程', logout: 'ログアウト',
    auth: 'ログインまたは会員登録', language: '言語を選択', lightMode: 'ライトモードに切り替え', darkMode: 'ダークモードに切り替え',
  },
  zh: {
    mainMenu: '主菜单', openMenu: '打开菜单', closeMenu: '关闭菜单',
    accommodationSearch: '搜索住宿', destination: '目的地', destinationSearch: '搜索目的地', search: '搜索',
    userMenu: '用户菜单', myPage: '我的主页', reservations: '预订记录', wishlist: '收藏住宿', trips: '旅行计划', logout: '退出登录',
    auth: '登录或注册', language: '选择语言', lightMode: '切换到浅色模式', darkMode: '切换到深色模式',
  },
} satisfies Record<Locale, Record<string, string>>
