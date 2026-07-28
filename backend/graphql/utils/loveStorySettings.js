const { LoveStorySettings } = require('../../models');

// Site chỉ có 1 document settings (singleton) mỗi tenant — tạo mới nếu chưa có.
async function getOrCreateSettings(tenant) {
    const Model = LoveStorySettings(tenant);
    let doc = await Model.findOne({}).lean();
    if (!doc) {
        doc = (await new Model({}).save()).toObject();
    }
    return doc;
}

module.exports = { getOrCreateSettings };
