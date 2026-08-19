/* ==========================================================================
   Question Bank & Shuffle Engine for Ular Tangga (Couple Edition)
   ========================================================================== */

const COUPLE_QUESTIONS = [
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
];

class QuestionBank {
    constructor() {
        this._all       = [...COUPLE_QUESTIONS];
        this._remaining = [...this._all];
        this._shuffleArray(this._remaining);
    }

    _shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    getRandomQuestion() {
        // Jika semua pertanyaan sudah terpakai, reset dan kocok ulang
        if (this._remaining.length === 0) {
            this._remaining = [...this._all];
            this._shuffleArray(this._remaining);
        }
        return this._remaining.pop();
    }

    reset() {
        this._remaining = [...this._all];
        this._shuffleArray(this._remaining);
    }

    getInitialPrompt() {
        return 'Silakan lempar dadu untuk memulai! Jika pion mendarat di kotak <strong>?</strong>, klik <strong>Shuffle</strong> untuk mendapatkan pertanyaan romantis.';
    }
}

const questionBank = new QuestionBank();
