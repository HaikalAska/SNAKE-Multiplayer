/* ==========================================================================
   Events Bank - Ular Tangga: (Couple Edition)
   questions, challenges, romantic, bonus, penalty, WILDCARD (kartu risiko)
   ========================================================================== */

const EVENTS = {
    questions: [
    "Kapan pertama kali kamu sadar kalau perasaanmu ke pasanganmu ternyata lebih dari sekadar suka?",
    "Kalau suatu hari kita nggak bisa bersama lagi, hal apa dari hubungan kita yang paling ingin kamu bawa sampai kapan pun?",
    "Apa satu hal dari pasanganmu yang mungkin nggak pernah dia sadari, tapi sebenarnya sangat kamu cintai?",
    "Kalau kamu bisa mengulang satu momen dalam hubungan kita, momen apa yang ingin kamu rasakan sekali lagi?",
    "Apa hal yang paling kamu takutkan akan berubah dari hubungan kita seiring berjalannya waktu?",
    "Kalau suatu hari pasanganmu merasa dirinya nggak cukup baik untukmu, apa yang ingin kamu katakan kepadanya?",
    "Apa momen kecil yang pernah kita alami yang ternyata diam-diam sangat berarti buat kamu?",
    "Kalau kamu harus menjelaskan alasan kamu masih memilih pasanganmu sampai hari ini tanpa menggunakan kata 'sayang' atau 'cinta', apa jawabanmu?",
    "Apa satu kekurangan pasanganmu yang justru membuat kamu merasa dia semakin manusiawi dan semakin kamu sayangi?",
    "Pernah nggak kamu pura-pura baik-baik aja di depan pasanganmu padahal sebenarnya kamu lagi butuh dia? Kapan?",
    "Kalau kamu bisa melihat hubungan kita dari sudut pandang orang lain, menurutmu apa hal paling indah dari kita?",
    "Apa hal yang paling ingin kamu lakukan untuk pasanganmu sebelum kita sama-sama terlalu sibuk dengan kehidupan masing-masing?",
    "Kalau suatu hari kita sedang berada di titik terberat dalam hubungan, apa alasan yang akan membuat kamu memilih untuk tetap bertahan?",
    "Apa satu kenangan tentang kita yang menurutmu akan selalu terasa spesial meskipun nanti kita sudah tua?",
    "Apa hal yang selama ini ingin kamu dengar dari pasanganmu, tapi belum pernah kamu minta secara langsung?",
    "Kalau pasanganmu kehilangan kepercayaan dirinya, bagian mana dari dirinya yang akan kamu ingatkan bahwa kamu tetap cintai?",
    "Menurutmu, apa yang membuat hubungan kita berbeda dari hubunganmu dengan orang lain sebelumnya?",
    "Kapan terakhir kali pasanganmu membuat kamu berpikir, 'Untung banget gue ketemu orang ini'?",
    "Kalau kamu diberi kesempatan untuk mengatakan satu hal kepada pasanganmu tanpa takut dihakimi atau disalahpahami, apa yang ingin kamu katakan?",
    "Apa satu hal yang paling kamu harapkan tetap ada di antara kita meskipun hubungan ini sudah berjalan bertahun-tahun?",
    "Kalau suatu hari kita lupa bagaimana awal mula kita jatuh cinta, cerita apa tentang kita yang ingin kamu ceritakan kembali?",
    "Apa bagian dari dirimu yang menurutmu hanya bisa benar-benar kamu tunjukkan ketika sedang bersama pasanganmu?",
    "Kalau kamu tahu hubungan kita akan melewati banyak masalah di masa depan, apakah kamu tetap akan memilih untuk memulainya? Kenapa?",
    "Apa satu alasan paling jujur yang membuat kamu takut kehilangan pasanganmu?",
    "Kalau pasanganmu tiba-tiba bertanya, 'Apa yang bikin kamu yakin aku adalah orang yang tepat?', apa jawaban paling jujurmu?",
    "Apa hal sederhana yang dilakukan pasanganmu yang membuat kamu merasa benar-benar dicintai?",
    "Kalau kamu bisa menyimpan satu perasaan yang pernah kamu rasakan saat bersama pasanganmu untuk selamanya, perasaan apa yang kamu pilih?",
    "Apa satu hal yang ingin kamu janjikan kepada pasanganmu, bukan karena dia meminta, tapi karena kamu sendiri ingin melakukannya?",
    "Kalau suatu hari nanti kita melihat kembali hubungan ini dari masa tua, apa yang paling ingin kamu banggakan dari perjalanan kita?",
    "Kalau pasanganmu sedang meragukan apakah dirinya pantas dicintai, apa yang akan kamu katakan untuk meyakinkannya?"
    ],

    challenges: [
        { text: "Bilang 3 hal spesifik yang kamu suka dari pasanganmu dengan penuh perasaan!", instruction: "Lakukan sekarang dengan tulus! Pasangan juga harus merespons." },
        { text: "Tiru ekspresi muka pasanganmu yang paling sering kamu lihat!", instruction: "Pasanganmu yang nilai, apakah mirip atau tidak!" },
        { text: "Nyanyikan sepotong lagu yang mengingatkanmu dengan pasanganmu!", instruction: "Minimal 1 bait ya, jangan malu-malu!" },
        { text: "Kasih pujian paling spesifik ke pasanganmu dalam 15 detik!", instruction: "Hitung mundur! Pujian harus jujur dan dari hati." },
        { text: "Peragakan cara jalan atau cara ngomong pasanganmu!", instruction: "Pasangan yang nilai, apakah akurat!" },
        { text: "Sebutkan 5 hal kecil yang sering pasanganmu lakukan tanpa sadar!", instruction: "Ini tes seberapa teliti kamu memperhatikan pasanganmu!" },
        { text: "Gambarkan pasanganmu hanya dengan 3 kata sifat, lalu jelaskan alasannya!", instruction: "Pasangan boleh setuju atau tidak setuju." },
        { text: "Bicara selama 30 detik tanpa berhenti tentang kenapa kamu suka sama pasanganmu!", instruction: "Tidak boleh diam lebih dari 3 detik!" },
        { text: "Tebak: apa yang sedang pasanganmu pikirkan sekarang?", instruction: "Pasanganmu konfirmasi, benar atau salah!" },
        { text: "Ceritain satu momen yang bikin kamu mikir 'dia emang jodoh gue'!", instruction: "Boleh sepanjang apapun ceritanya." },
        { text: "Tunjukkan ekspresi kamu waktu pertama kali jatuh cinta sama pasanganmu!", instruction: "Pasanganmu nilai apakah dramatis atau tidak!" },
        { text: "Kalau hanya boleh bawa 1 benda milik pasanganmu ke mana-mana, kamu pilih apa?", instruction: "Jelaskan alasanmu!" }
    ],

    romantic: [
        { text: "Pasangan yang kompak dapat bonus! Kalian serasi banget hari ini.", bonus: 3 },
        { text: "Love is in the air! Ketulusan cintamu membawa keberuntungan.", bonus: 3 },
        { text: "Karma baik! Pasangan yang saling mendukung mendapat hadiah.", bonus: 3 },
        { text: "Cinta memberi sayap! Perasaanmu yang tulus membawamu maju.", bonus: 3 },
        { text: "Sweet couple bonus! Kalian terlihat bahagia hari ini.", bonus: 3 },
        { text: "The universe ships you! Semesta mendukung cinta kalian.", bonus: 3 },
        { text: "Couple goals! Energi positif kalian hari ini luar biasa.", bonus: 3 }
    ],

    bonus: [
        "Selamat! Kamu mendapat giliran ekstra. Lempar dadu sekali lagi!",
        "Lucky roll! Keberuntungan bersamamu. Lempar dadu lagi!",
        "Double chance! Kamu mendapat kesempatan tambahan.",
        "Fortune smiles! Kamu beruntung — lempar dadu satu kali lagi!"
    ],

    penalty: [
        "Oops! Nasib kurang beruntung. Kamu harus melewati giliran berikutnya.",
        "Pause! Istirahat sejenak — kamu skip 1 ronde ya.",
        "Bad luck! Kamu harus menunggu satu giliran sebelum bisa jalan lagi.",
        "Time out! Kamu skip giliran berikutnya."
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // 🎴 KARTU RISIKO — bisa dapat hal bagus ATAU hal buruk, serba random!
    // effect types:
    //   'toStart'      → balik ke kotak 1
    //   'back_N'       → mundur N kotak
    //   'forward_N'    → maju N kotak
    //   'toTile_N'     → langsung ke kotak N
    //   'extraRoll'    → lempar dadu lagi
    //   'skipTurn'     → skip giliran berikutnya
    //   'opponentBack' → lawan mundur 5 kotak (efek pada player lain)
    //   'swapPosition' → tukar posisi dengan lawan!
    // ═══════════════════════════════════════════════════════════════════════
    wildcard: [
        // ── NASIB BURUK (bad luck) ─────────────────────────────────────────
        {
            kind:   'bad',
            icon:   '🐴',
            title:  'DITABRAK KUDA!',
            desc:   'Dari mana dataangnya kuda ini?! Kamu mental balik ke START!',
            effect: 'toStart'
        },
        {
            kind:   'bad',
            icon:   '🌪️',
            title:  'KENA TORNADO!',
            desc:   'Angin puting beliung tiba-tiba muncul dan membawamu mundur 15 kotak!',
            effect: 'back_15'
        },
        {
            kind:   'bad',
            icon:   '🛵',
            title:  'KESEREMPET OJEK!',
            desc:   'Si ojek ngebut tanpa lihat kiri-kanan. Kamu mundur 8 kotak!',
            effect: 'back_8'
        },
        {
            kind:   'bad',
            icon:   '🐔',
            title:  'DIKEJAR AYAM KAMPUNG!',
            desc:   'Ayam itu galak banget! Kamu lari mundur sampai 6 kotak ke belakang.',
            effect: 'back_6'
        },
        {
            kind:   'bad',
            icon:   '⚡',
            title:  'KESETRUM COLOKAN!',
            desc:   'Jangan mainin listrik! Kamu pingsan dan skip giliran berikutnya.',
            effect: 'skipTurn'
        },
        {
            kind:   'bad',
            icon:   '🍌',
            title:  'KEPLESET KULIT PISANG!',
            desc:   'Classic! Kamu terpeleset dan jatuh mundur 5 kotak.',
            effect: 'back_5'
        },
        {
            kind:   'bad',
            icon:   '🦟',
            title:  'DISERBU NYAMUK!',
            desc:   'Nyamuknya banyak banget! Kamu lari ketakutan mundur 7 kotak.',
            effect: 'back_7'
        },
        {
            kind:   'bad',
            icon:   '🐍',
            title:  'WABAH ULAR!',
            desc:   'BENCANA SERANGAN ULAR! Papan dipenuhi 16 ular raksasa selama 5 giliran!',
            effect: 'event_snakeOutbreak'
        },
        {
            kind:   'bad',
            icon:   '💨',
            title:  'BADAI ANGIN!',
            desc:   'ANGIN KENCANG BERTIUP! Setiap lemparan dadu, pemain tersapu mundur 2 langkah selama 4 giliran!',
            effect: 'event_windStorm'
        },
        {
            kind:   'bad',
            icon:   '📱',
            title:  'HP LOWBAT!',
            desc:   'HP mati tiba-tiba, kamu panik. Pasanganmu maju 3 kotak karena ketawa.',
            effect: 'opponentForward_3'
        },

        // ── NASIB BAIK (good luck) ─────────────────────────────────────────
        {
            kind:   'good',
            icon:   '🚀',
            title:  'NAIK ROKET!',
            desc:   'WHOOOOSH! Kamu melesat maju 12 kotak sekarang!',
            effect: 'forward_12'
        },
        {
            kind:   'good',
            icon:   '🪜',
            title:  'HUJAN TANGGA!',
            desc:   'BERKAH SEMESTA! Tangga-tangga raksasa bermunculan di papan selama 5 giliran!',
            effect: 'event_ladderRain'
        },
        {
            kind:   'good',
            icon:   '🍀',
            title:  'KETEMU KEBERUNTUNGAN!',
            desc:   'Hari yang sangat beruntung! Maju 8 kotak gratis!',
            effect: 'forward_8'
        },
        {
            kind:   'good',
            icon:   '🎲',
            title:  'DOUBLE DICE!',
            desc:   'Lempar dadu 2 kali sekarang! Jumlahkan hasilnya!',
            effect: 'extraRoll'
        },
        {
            kind:   'good',
            icon:   '💌',
            title:  'SURAT CINTA TIBA!',
            desc:   'Surat cinta dari pasanganmu memberi semangat! Maju 5 kotak!',
            effect: 'forward_5'
        },
        {
            kind:   'good',
            icon:   '🏎️',
            title:  'NYEWA SPORT CAR!',
            desc:   'Ngebut di jalan! Langsung maju 10 kotak sekarang!',
            effect: 'forward_10'
        },
        {
            kind:   'good',
            icon:   '😈',
            title:  'KARTU JAHAT!',
            desc:   'Kamu beruntung! Pasanganmu yang harus mundur 5 kotak, bukan kamu!',
            effect: 'opponentBack_5'
        },
        {
            kind:   'good',
            icon:   '🔄',
            title:  'TUKAR POSISI!',
            desc:   'PLOT TWIST! Posisimu dan posisi pasanganmu ditukar sekarang!',
            effect: 'swapPosition'
        },
        {
            kind:   'good',
            icon:   '☁️',
            title:  'NAIK AWAN NINJA!',
            desc:   'Kamu terbang di awan dan langsung loncat ke kotak 50!',
            effect: 'toTile_50'
        }
    ]
};

class EventBank {
    constructor() {
        this._remaining = this._buildRemaining();
    }

    _buildRemaining() {
        return {
            questions:  this._shuffle([...EVENTS.questions]),
            challenges: this._shuffle([...EVENTS.challenges]),
            romantic:   this._shuffle([...EVENTS.romantic]),
            bonus:      this._shuffle([...EVENTS.bonus]),
            penalty:    this._shuffle([...EVENTS.penalty]),
            wildcard:   this._shuffle([...EVENTS.wildcard])
        };
    }

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _getFrom(category) {
        if (this._remaining[category].length === 0) {
            this._remaining[category] = this._shuffle([...EVENTS[category]]);
        }
        return this._remaining[category].pop();
    }

    getQuestion()   { return this._getFrom('questions'); }
    getChallenge()  { return this._getFrom('challenges'); }
    getRomantic()   { return this._getFrom('romantic'); }
    getBonus()      { return this._getFrom('bonus'); }
    getPenalty()    { return this._getFrom('penalty'); }
    getWildcard()   { return this._getFrom('wildcard'); }

    reset() { this._remaining = this._buildRemaining(); }

    // Compat shims
    getRandomQuestion() { return this.getQuestion(); }
    getInitialPrompt()  {
        return '🎲 Lempar dadu & jalani petualangan cinta kalian! Berbagai kejutan menanti.';
    }
}

const questionBank = new EventBank();
