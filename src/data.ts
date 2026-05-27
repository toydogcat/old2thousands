export interface DecadeContent {
  id: string;
  title: string;
  description: string;
  categories: {
    name: string;
    items: string[];
    icon: string;
  }[];
}

export const DECADES: DecadeContent[] = [
  {
    id: '1970',
    title: '1970s 懷舊時光機',
    description: '交織著變革、浪漫、自由與無限想像力的偉大年代。',
    categories: [
      {
        name: '🎬 經典電影',
        icon: 'Film',
        items: ['李小龍真功夫旋風', '星際大戰', '大白鯊', '教父']
      },
      {
        name: '🤖 經典動漫',
        icon: 'Bot',
        items: ['無敵鐵金剛', '鋼彈', '哆啦A夢']
      },
      {
        name: '🎶 傳奇旋律',
        icon: 'Music',
        items: ['鄧麗君', '台灣校園民歌', 'Queen', 'Eagles', 'ABBA']
      },
      {
        name: '🕹️ 經典遊戲',
        icon: 'Gamepad2',
        items: ['Pong', 'Atari 2600', '太空侵略者']
      }
    ]
  },
  {
    id: '1980',
    title: '1980s 紅白機盛世',
    description: '色彩斑斕、充滿動感、將流行文化推向極致的「大霹靂時代」。',
    categories: [
      {
        name: '🎬 經典電影',
        icon: 'Film',
        items: ['英雄本色', '倩女幽魂', '回到未來', '魔鬼終結者']
      },
      {
        name: '🤖 經典動漫',
        icon: 'Bot',
        items: ['七龍珠', '聖鬥士星矢', '龍貓', '阿基拉']
      },
      {
        name: '🎶 傳奇旋律',
        icon: 'Music',
        items: ['羅大佑', '蘇芮', 'Michael Jackson', 'SONY Walkman']
      },
      {
        name: '🕹️ 經典遊戲',
        icon: 'Gamepad2',
        items: ['任天堂紅白機', '超級瑪利歐', '薩爾達']
      },
      {
        name: '📺 經典影集',
        icon: 'Tv',
        items: ['馬蓋先', '霹靂遊俠', '天龍特攻隊']
      }
    ]
  },
  {
    id: '1990',
    title: '1990s 世紀末盛世',
    description: '數位革命與世紀末狂歡，最好的時代，也是最豐富的時代。',
    categories: [
      {
        name: '🎬 經典電影',
        icon: 'Film',
        items: ['侏羅紀公園', '鐵達尼號', '駭客任務']
      },
      {
        name: '🧬 經典動漫',
        icon: 'Bot',
        items: ['灌籃高手', '新世紀福音戰士', '魔法騎士', '美少女戰士']
      },
      {
        name: '🎧 經典音樂',
        icon: 'Music',
        items: ['張學友 - 吻別', '伍佰 - 挪威的森林', 'Discman']
      },
      {
        name: '💾 經典遊戲',
        icon: 'Gamepad2',
        items: ['PS1 - 最終幻想 7', '世紀帝國', '星海爭霸']
      }
    ]
  },
  {
    id: '2000',
    title: '2000s 千禧大典',
    description: 'Y2K 數位奇蹟，從 MSN 到周杰倫宇宙的奔騰十年。',
    categories: [
      {
        name: '🎬 經典電影',
        icon: 'Film',
        items: ['魔戒', '阿凡達', '神隱少女', '無間道']
      },
      {
        name: '🍥 經典動漫',
        icon: 'Bot',
        items: ['火影忍者', '航海王', '鋼之鍊金術師', '數碼寶貝']
      },
      {
        name: '🎧 經典音樂',
        icon: 'Music',
        items: ['周杰倫', '陳奕迅', '五月天', 'Linkin Park']
      },
      {
        name: '🎮 經典遊戲',
        icon: 'Gamepad2',
        items: ['仙境傳說 RO', '魔獸世界', 'PS2', 'CS 1.6']
      }
    ]
  }
];
