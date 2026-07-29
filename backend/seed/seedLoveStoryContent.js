// Seed 1 lần nội dung tĩnh cũ (love-story/src/data/storyData.js) vào DB cho tenant
// LOVESTORY, để chuyển site từ dữ liệu hardcode sang dữ liệu BE mà không mất nội dung
// đã có (8 chương, 6 ảnh gallery, 9 tin nhắn chat, quote, thư cuối...).
// Idempotent: bỏ qua nếu StoryChapters đã có dữ liệu.
const fs = require('fs');
const path = require('path');

const logger = require('../logger');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { StoryChapters, GalleryPhotos, ChatMessages, LoveStorySettings, UploadFiles } = require('../models');

// Ảnh nằm ngay trong backend/ (không phải ../../love-story/src/assets) vì
// Docker build của backend chỉ COPY đúng thư mục backend/ (xem render.yaml
// `dockerContext: backend`) — nếu để ở love-story/ thì trên Render sẽ không
// bao giờ thấy file, ảnh luôn bị bỏ qua khi seed.
const ASSETS_DIR = path.join(__dirname, 'assets');

const HERO_BACKGROUND_ASSET = 'hình_2_đứa_đi_vũng_tàu2.png';
const FINAL_BACKGROUND_ASSET = 'hình_em_đẹp_background2.png';

// Khớp asset <-> document đã tồn tại bằng title (chapter) / caption (gallery),
// nên dùng chung 1 danh sách cho cả lúc tạo mới lẫn lúc backfill ảnh còn thiếu.
const CHAPTERS_SEED = [
    { legacyId: 2, date: '24/12/2025', title: 'Lần đầu nhắn tin', content: 'Một tin nhắn "chào bạn" ngại ngùng, gõ đi xoá lại không biết bao nhiêu lần, cuối cùng cũng bấm gửi. Ai mà ngờ được một câu chào đơn giản như vậy lại mở ra hàng ngàn tin nhắn, hàng trăm đêm thức khuya trò chuyện sau đó.', hidden_thought: 'Mình đã gõ lại câu đó ít nhất 5 lần trước khi gửi.', mood: 'funny', asset: 'b.png', has_voice_note: false, locked: false },
    { legacyId: 1, date: '14/01/2026', title: 'Lần đầu gặp nhau', content: 'Một buổi tối rất bình thường, nhưng lại là khởi đầu cho một câu chuyện không bình thường. Mình đã đứng đó, ngại ngùng không biết bắt đầu câu chuyện từ đâu. Ánh mắt đầu tiên ấy, đến giờ vẫn còn nhớ rõ như mới hôm qua.', hidden_thought: 'Lúc đó mình đã nghĩ: "người này có gì đó khác lắm."', mood: 'happy', asset: 'a.png', has_voice_note: true, locked: false },
    { legacyId: 4, date: '20/01/2026', title: 'Lần đầu cãi nhau', content: 'Chuyện to cũng có chuyện nhỏ cũng có, Nhưng rồi ai cũng là người chủ động nhắn lại trước. Hoá ra giận nhau cũng là một cách để hiểu nhau hơn một chút.', hidden_thought: 'Thật ra lúc đó chỉ sợ một điều: mất nhau.', mood: 'sad', asset: 'hình_em_giận.png', has_voice_note: false, locked: false },
    { legacyId: 5, date: '21/01/2026', title: 'Ngày tỏ tình', content: 'Một hộp quà nhỏ, một chú thỏ bông và một trái tim đập nhanh hơn bình thường. Anh đã lấy hết can đảm để nói điều mình giữ trong lòng bấy lâu. Khi em mỉm cười nhận món quà và đồng ý, ngày 21/01 đã trở thành ngày đặc biệt nhất của cả hai.', hidden_thought: 'Cảm ơn em vì đã chọn anh từ khoảnh khắc ấy.', mood: 'love', asset: 'totinh.png', has_voice_note: false, locked: false },
    { legacyId: 3, date: '28/01/2026', title: 'Lần đầu hẹn hò', content: 'Buổi hẹn đầu tiên, tim đập nhanh hơn bình thường gấp mấy lần. Bờ kè sông Sài Gòn, hai ly nước chưa kịp uống đã nguội vì mải nói chuyện. Một cuộc trò chuyện mà cả hai đều không muốn nó kết thúc.', hidden_thought: 'Mình đã chọn áo tới 3 lần trước khi ra cửa.', mood: 'happy', asset: '2_đứa_đi_cà_phê.png', has_voice_note: true, locked: false },
    { legacyId: 6, date: '14/02/2026', title: 'Valentine đầu tiên', content: 'Không cần gì cầu kỳ, chỉ cần ngồi cạnh nhau tâm sự ăn uống ( ăn thịt thỏ) cũng đủ thấy ấm. Đó là lúc mình nhận ra, hạnh phúc đôi khi chỉ đơn giản là có người đó ở bên.', hidden_thought: 'Mình đã âm thầm chụp lại khoảnh khắc đó, không nói gì.', mood: 'deep', asset: 'hình_em_đẹp_background.png', has_voice_note: true, locked: false },
    { legacyId: 7, date: '24/06/2026', title: 'Kỷ niệm 6 tháng', content: 'Sáu tháng đầu tiên bên nhau, với rất nhiều lần cười, vài lần giận, và muôn vàn lý do để yêu nhau nhiều hơn mỗi ngày. Chặng đường còn dài, nhưng mình tin cả hai sẽ luôn nắm tay nhau đi qua hết.', hidden_thought: 'Mình mong sáu tháng tiếp theo cũng sẽ nhiều như vậy.', mood: 'deep', asset: 'quà_6th.png', has_voice_note: false, locked: false },
    { legacyId: 8, date: '???', title: '🔓 Ký ức bí mật', content: 'Bạn đã tìm ra góc nhỏ bí mật này rồi! Đây là điều mà chỉ có hai người mới biết: cảm ơn vì đã luôn kiên nhẫn, luôn dịu dàng, và luôn chọn ở lại dù mọi thứ không hoàn hảo. Đây là một ký ức chỉ dành riêng cho bạn. 💕', hidden_thought: 'Cảm ơn vì đã tò mò đủ để tìm ra điều này.', mood: 'deep', asset: '2_đứa_đi_long_an.png', has_voice_note: false, locked: true },
];

const GALLERY_PHOTOS_SEED = [
    { asset: '2_đứa_đi_thuỷ_cung.png', caption: 'Hai đứa đi thuỷ cung 🐠' },
    { asset: 'hình_em_ở_thuỷ_cung.png', caption: 'Em ở thuỷ cung 🐡' },
    { asset: '2_đứa_đi_đảo_thạnh_an.png', caption: 'Hai đứa đi đảo Thạnh An ⛵' },
    { asset: 'hình_2_đứa_đi_vũng_tàu.png', caption: 'Hai đứa đi Vũng Tàu 🌊' },
    { asset: 'hình_2_đứa_đi_vũng_tàu2.png', caption: 'Vũng Tàu, lần nữa 🌅' },
    { asset: 'đi_chơi_ở_long_an.png', caption: 'Đi chơi ở Long An 🌾' },
];

async function copyAssetToUploads(tenant, assetFileName) {
    const srcPath = path.join(ASSETS_DIR, assetFileName);
    if (!fs.existsSync(srcPath)) {
        logger.info(`seedLoveStoryContent: asset not found, skip: ${assetFileName}`);
        return '';
    }

    const buffer = await fs.promises.readFile(srcPath);
    const secureUrl = await uploadToCloudinary(buffer, assetFileName);

    const ext = path.extname(assetFileName);
    const saved = await new (UploadFiles(tenant))({
        FILE: secureUrl,
        FILE_NAME: assetFileName,
        FILE_TYPE: ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : '',
    }).save();
    return String(saved._id);
}

// `LoveStory_public_settings` (getOrCreateSettings) có thể đã tự tạo 1 document
// settings rỗng nếu ai đó load trang Login trước khi seed này kịp chạy — dọn các
// bản rỗng thừa đó, chỉ giữ lại 1 document (ưu tiên bản đã có anniversary_password).
async function dedupeLoveStorySettings(tenant) {
    const Model = LoveStorySettings(tenant);
    const docs = await Model.find({}).sort({ created_at: 1 }).lean();
    if (docs.length <= 1) return;

    const keep = docs.find((d) => d.anniversary_password) || docs[docs.length - 1];
    const idsToRemove = docs.filter((d) => String(d._id) !== String(keep._id)).map((d) => d._id);
    await Model.deleteMany({ _id: { $in: idsToRemove } });
    logger.info(`seedLoveStoryContent: đã xoá ${idsToRemove.length} document settings trùng, giữ lại ${keep._id}`);
}

// Ảnh cũ (trước khi đổi sang Cloudinary) trỏ tới đường dẫn local dạng
// "story-chapters/uuid.png" — các file đó đã mất sạch vì đĩa Render không
// bền vững giữa các lần deploy/restart. Chỉ ảnh mới (Cloudinary) mới có FILE
// dạng URL đầy đủ (http...), nên dùng đó để phân biệt "còn thiếu/hỏng ảnh"
// thay vì chỉ check field có rỗng hay không.
async function needsImageBackfill(tenant, uploadFileId) {
    if (!uploadFileId) return true;
    const file = await UploadFiles(tenant).findById(uploadFileId).lean();
    return !file || !/^https?:\/\//.test(file.FILE || '');
}

// Chạy mỗi lần boot, khớp lại đúng document đang thiếu/hỏng ảnh với asset
// tương ứng theo title/caption gốc rồi điền/thay vào. Không đụng tới
// document đã có ảnh Cloudinary hợp lệ.
async function backfillMissingImages(tenant) {
    const settings = await LoveStorySettings(tenant).findOne({}).lean();
    if (settings) {
        const patch = {};
        if (await needsImageBackfill(tenant, settings.hero_background)) {
            const id = await copyAssetToUploads(tenant, HERO_BACKGROUND_ASSET);
            if (id) patch.hero_background = id;
        }
        if (await needsImageBackfill(tenant, settings.final_background)) {
            const id = await copyAssetToUploads(tenant, FINAL_BACKGROUND_ASSET);
            if (id) patch.final_background = id;
        }
        if (Object.keys(patch).length > 0) {
            await LoveStorySettings(tenant).findByIdAndUpdate(settings._id, patch);
            logger.info('backfillMissingImages: đã bổ sung ảnh nền settings');
        }
    }

    const allChapters = await StoryChapters(tenant).find({}).lean();
    for (const doc of allChapters) {
        if (!(await needsImageBackfill(tenant, doc.image))) continue;
        const match = CHAPTERS_SEED.find((c) => c.title === doc.title);
        if (!match) continue;
        const image = await copyAssetToUploads(tenant, match.asset);
        if (image) {
            await StoryChapters(tenant).findByIdAndUpdate(doc._id, { image });
            logger.info(`backfillMissingImages: đã bổ sung ảnh cho chương "${doc.title}"`);
        }
    }

    const allGallery = await GalleryPhotos(tenant).find({}).lean();
    for (const doc of allGallery) {
        if (!(await needsImageBackfill(tenant, doc.src))) continue;
        const match = GALLERY_PHOTOS_SEED.find((p) => p.caption === doc.caption);
        if (!match) continue;
        const src = await copyAssetToUploads(tenant, match.asset);
        if (src) {
            await GalleryPhotos(tenant).findByIdAndUpdate(doc._id, { src });
            logger.info(`backfillMissingImages: đã bổ sung ảnh cho gallery "${doc.caption}"`);
        }
    }
}

async function seedLoveStoryContent(tenant) {
    await dedupeLoveStorySettings(tenant);
    await backfillMissingImages(tenant);

    const alreadySeeded = await StoryChapters(tenant).countDocuments({});
    if (alreadySeeded > 0) return;

    logger.info('Seeding love story content...');

    const heroBackground = await copyAssetToUploads(tenant, HERO_BACKGROUND_ASSET);
    const finalBackground = await copyAssetToUploads(tenant, FINAL_BACKGROUND_ASSET);

    // Nếu getOrCreateSettings đã tạo sẵn 1 document rỗng, cập nhật vào đó thay vì
    // insert thêm bản mới — tránh lặp lại chính lỗi vừa dọn ở trên.
    const existingSettings = await LoveStorySettings(tenant).findOne({}).lean();

    const settingsPayload = {
        couple_person1: 'Khánh Duy',
        couple_person2: 'Phương Thảo',
        start_date: '2025-12-24T00:00:00',
        tagline: ['Đây không chỉ là một trang web…', 'Đây là cả vũ trụ kỷ niệm của chúng mình.'],
        anniversary_password: '24/12/2025',
        secret_code: 'ourstory',
        hero_background: heroBackground,
        final_background: finalBackground,
        love_quotes: [
            'Yêu không phải tìm một người hoàn hảo, mà là học cách nhìn một người không hoàn hảo theo cách hoàn hảo nhất.',
            'Có những ngày bình thường, nhưng có em, ngày nào cũng trở nên đặc biệt.',
            'Hạnh phúc là khi cùng một người, mỗi ngày đều muốn kể thêm một câu chuyện mới.',
            'Anh không hứa sẽ cho em cả thế giới, chỉ hứa sẽ luôn ở đó khi em quay lại nhìn.',
            'Tình yêu đẹp nhất là khi cả hai cùng chọn nhau, mỗi ngày, không chỉ một lần.',
        ],
        final_letter_intro: [
            'Nếu bạn đang đọc được những dòng này…',
            'Nghĩa là bạn đã đi đến cuối hành trình kỷ niệm của chúng mình.',
        ],
        final_letter_title: 'Lá thư cuối 💌',
        final_letter_paragraphs: [
            'Cảm ơn vì đã dành thời gian đi qua hết hành trình nhỏ này cùng mình, từng chương, từng kỷ niệm.',
            'Có thể chúng ta không hoàn hảo, nhưng những gì dành cho nhau lại rất thật. Mỗi ngày bên nhau là một ngày đáng để biết ơn.',
            'Mong rằng dù mai này có ra sao, mình vẫn sẽ nắm tay nhau đi qua hết những chặng đường còn lại. Yêu bạn, hôm nay và mãi về sau.',
        ],
        final_letter_signature: '— Người yêu bạn nhất',
        footer_made_by: 'Khánh Duy',
        music_src: './music/bg-music.mp3',
        track_title: 'Khánh Duy & Phương Thảo — Bài Hát Của Chúng Mình',
    };

    if (existingSettings) {
        await LoveStorySettings(tenant).findByIdAndUpdate(existingSettings._id, settingsPayload);
    } else {
        await new (LoveStorySettings(tenant))(settingsPayload).save();
    }

    const legacyIdToMongoId = {};
    for (let i = 0; i < CHAPTERS_SEED.length; i++) {
        const c = CHAPTERS_SEED[i];
        const image = await copyAssetToUploads(tenant, c.asset);
        const saved = await new (StoryChapters(tenant))({
            date: c.date,
            title: c.title,
            content: c.content,
            hidden_thought: c.hidden_thought,
            mood: c.mood,
            image,
            has_voice_note: c.has_voice_note,
            locked: c.locked,
            sort_order: i,
        }).save();
        legacyIdToMongoId[c.legacyId] = String(saved._id);
    }

    for (let i = 0; i < GALLERY_PHOTOS_SEED.length; i++) {
        const p = GALLERY_PHOTOS_SEED[i];
        const src = await copyAssetToUploads(tenant, p.asset);
        await new (GalleryPhotos(tenant))({ src, caption: p.caption, sort_order: i }).save();
    }

    const chatMessagesSeed = [
        { sender: 'me', text: 'Đang nói đến đây rồi chị', time: '23:53', legacyStoryId: 1 },
        { sender: 'her', text: 'À nhớ rồi, hôm đó chị cũng ngại quá đi 😂', time: '20:15', legacyStoryId: 2 },
        { sender: 'me', text: 'Cuối tuần đi uống nước không?', time: '21:03', legacyStoryId: 3 },
        { sender: 'her', text: 'Ok đó, hẹn 8h tối nha', time: '21:05', legacyStoryId: 3 },
        { sender: 'me', text: 'Anh có chuyện muốn nói với em 🙄', time: '22:40', legacyStoryId: 4 },
        { sender: 'her', text: '...', time: '23:58', legacyStoryId: 4 },
        { sender: 'her', text: 'Happy Valentine ❤️', time: '08:00', legacyStoryId: 5 },
        { sender: 'me', text: '6 tháng rồi đó, cảm ơn em vì đã ở đây 🥹', time: '09:12', legacyStoryId: 6 },
    ];
    for (let i = 0; i < chatMessagesSeed.length; i++) {
        const m = chatMessagesSeed[i];
        await new (ChatMessages(tenant))({
            sender: m.sender,
            text: m.text,
            time: m.time,
            story_id: legacyIdToMongoId[m.legacyStoryId] || '',
            sort_order: i,
        }).save();
    }

    logger.info('Seeded love story content: settings, chapters, gallery, chat.');
}

module.exports = { seedLoveStoryContent };
