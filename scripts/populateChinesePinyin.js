const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const manifestPath = path.join(dataDir, 'manifest.json');

// Comprehensive Chinese-to-Pinyin dictionary
const CHINESE_PINYIN = {
    // Basic words and characters
    "你": "nǐ", "好": "hǎo", "我": "wǒ", "是": "shì", "的": "de", "了": "le", "在": "zài", "有": "yǒu", "不": "bù", "这": "zhè", "那": "nà", "个": "gè", "一": "yī", "二": "èr", "三": "sān", "四": "sì", "五": "wǔ", "六": "liù", "七": "qī", "八": "bā", "九": "jiǔ", "十": "shí",
    "他": "tā", "她": "tā", "它": "tā", "们": "men", "什": "shén", "么": "me", "上": "shàng", "下": "xià", "来": "lái", "去": "qù", "出": "chū", "到": "dào", "时": "shí", "间": "jiān", "年": "nián", "月": "yuè", "日": "rì", "天": "tiān", "人": "rén", "大": "dà", "小": "xiǎo", "多": "duō", "少": "shǎo",
    
    // Common greetings and phrases
    "你好": "nǐ hǎo", "再见": "zài jiàn", "早上": "zǎo shàng", "下午": "xià wǔ", "晚上": "wǎn shàng", "谢谢": "xiè xiè", "客气": "kè qì", "对不起": "duì bù qǐ", "请": "qǐng", "没关系": "méi guān xì", "请问": "qǐng wèn",
    
    // Jobs and professions
    "学生": "xué shēng", "老师": "lǎo shī", "工程师": "gōng chéng shī", "医生": "yī shēng", "护士": "hù shì", "司机": "sī jī", "厨师": "chú shī", "警察": "jǐng chá", "律师": "lǜ shī", "经理": "jīng lǐ", "退休": "tuì xiū",
    
    // Family and relationships
    "家庭": "jiā tíng", "父亲": "fù qīn", "母亲": "mǔ qīn", "儿子": "ér zi", "女儿": "nǚ ér", "丈夫": "zhàng fu", "妻子": "qī zi", "哥哥": "gē ge", "姐姐": "jiě jie", "弟弟": "dì di", "妹妹": "mèi mei", "爷爷": "yé ye", "奶奶": "nǎi nai", "外公": "wài gōng", "外婆": "wài pó",
    "结婚": "jié hūn", "单身": "dān shēn", "孩子": "hái zi", "爱好": "ài hào", "阅读": "yuè dú", "旅行": "lǚ xíng", "音乐": "yīn yuè", "电影": "diàn yǐng", "运动": "yùn dòng", "游泳": "yóu yǒng", "跑步": "pǎo bù",
    
    // Travel and transportation
    "机场": "jī chǎng", "火车站": "huǒ chē zhàn", "公共汽车": "gōng gòng qì chē", "地铁": "dì tiě", "出租车": "chū zū chē", "酒店": "jiǔ diàn", "票": "piào", "单程": "dān chéng", "往返": "wǎng fǎn", "头等舱": "tóu děng cāng", "经济舱": "jīng jì cāng",
    "航班": "háng bān", "起飞": "qǐ fēi", "降落": "jiàng luò", "延误": "yán wù", "行李": "xíng lǐ", "护照": "hù zhào", "签证": "qiān zhèng", "海关": "hǎi guān", "入境": "rù jìng", "出境": "chū jìng",
    
    // Food and dining
    "餐厅": "cān tīng", "菜单": "cài dān", "服务员": "fú wù yuán", "点菜": "diǎn cài", "买单": "mǎi dān", "账单": "zhàng dān", "小费": "xiǎo fèi", "早餐": "zǎo cān", "午餐": "wǔ cān", "晚餐": "wǎn cān",
    "米饭": "mǐ fàn", "面条": "miàn tiáo", "饺子": "jiǎo zi", "包子": "bāo zi", "汤": "tāng", "茶": "chá", "咖啡": "kā fēi", "啤酒": "pí jiǔ", "红酒": "hóng jiǔ", "果汁": "guǒ zhī", "水": "shuǐ",
    
    // Shopping
    "商店": "shāng diàn", "超市": "chāo shì", "市场": "shì chǎng", "价格": "jià gé", "多少": "duō shao", "钱": "qián", "便宜": "pián yi", "贵": "guì", "打折": "dǎ zhé", "现金": "xiàn jīn", "信用卡": "xìn yòng kǎ",
    "衣服": "yī fu", "鞋子": "xié zi", "帽子": "mào zi", "包": "bāo", "手表": "shǒu biǎo", "眼镜": "yǎn jìng", "化妆品": "huà zhuāng pǐn", "礼物": "lǐ wù",
    
    // Health and emergency
    "医院": "yī yuàn", "药店": "yào diàn", "药": "yào", "病": "bìng", "感冒": "gǎn mào", "发烧": "fā shāo", "头疼": "tóu téng", "肚子疼": "dù zi téng", "救命": "jiù mìng", "帮助": "bāng zhù", "警察": "jǐng chá", "消防": "xiāo fáng",
    
    // Technology and communication
    "电话": "diàn huà", "手机": "shǒu jī", "电脑": "diàn nǎo", "网络": "wǎng luò", "WiFi": "WiFi", "密码": "mì mǎ", "邮箱": "yóu xiāng", "微信": "wēi xìn", "QQ": "QQ",
    
    // Places and directions
    "这里": "zhè lǐ", "那里": "nà lǐ", "哪里": "nǎ lǐ", "附近": "fù jìn", "远": "yuǎn", "近": "jìn", "左": "zuǒ", "右": "yòu", "前": "qián", "后": "hòu", "东": "dōng", "南": "nán", "西": "xī", "北": "běi",
    "银行": "yín háng", "邮局": "yóu jú", "学校": "xué xiào", "公园": "gōng yuán", "博物馆": "bó wù guǎn", "图书馆": "tú shū guǎn", "电影院": "diàn yǐng yuán", "商场": "shāng chǎng",
    
    // Time expressions
    "现在": "xiàn zài", "今天": "jīn tiān", "明天": "míng tiān", "昨天": "zuó tiān", "早上": "zǎo shàng", "中午": "zhōng wǔ", "下午": "xià wǔ", "晚上": "wǎn shàng", "夜里": "yè lǐ",
    "星期": "xīng qī", "星期一": "xīng qī yī", "星期二": "xīng qī èr", "星期三": "xīng qī sān", "星期四": "xīng qī sì", "星期五": "xīng qī wǔ", "星期六": "xīng qī liù", "星期天": "xīng qī tiān",
    "小时": "xiǎo shí", "分钟": "fēn zhōng", "秒": "miǎo", "半": "bàn", "刻": "kè",
    
    // Common verbs
    "来": "lái", "去": "qù", "回": "huí", "到": "dào", "走": "zǒu", "跑": "pǎo", "开": "kāi", "关": "guān", "买": "mǎi", "卖": "mài", "吃": "chī", "喝": "hē", "看": "kàn", "听": "tīng", "说": "shuō", "读": "dú", "写": "xiě",
    "学": "xué", "教": "jiāo", "工作": "gōng zuò", "休息": "xiū xi", "睡觉": "shuì jiào", "起床": "qǐ chuáng", "洗澡": "xǐ zǎo", "洗手": "xǐ shǒu", "刷牙": "shuā yá",
    "喜欢": "xǐ huān", "爱": "ài", "讨厌": "tǎo yàn", "想": "xiǎng", "知道": "zhī dào", "明白": "míng bái", "忘记": "wàng jì", "记住": "jì zhù",
    
    // Common adjectives
    "好": "hǎo", "坏": "huài", "新": "xīn", "旧": "jiù", "快": "kuài", "慢": "màn", "高": "gāo", "矮": "ǎi", "胖": "pàng", "瘦": "shòu", "年轻": "nián qīng", "年老": "nián lǎo",
    "漂亮": "piào liang", "丑": "chǒu", "聪明": "cōng míng", "笨": "bèn", "热": "rè", "冷": "lěng", "干净": "gān jìng", "脏": "zāng", "安全": "ān quán", "危险": "wēi xiǎn",
    
    // Colors
    "颜色": "yán sè", "红色": "hóng sè", "黄色": "huáng sè", "蓝色": "lán sè", "绿色": "lǜ sè", "黑色": "hēi sè", "白色": "bái sè", "灰色": "huī sè", "粉色": "fěn sè", "紫色": "zǐ sè", "橙色": "chéng sè",
    
    // Weather
    "天气": "tiān qì", "晴天": "qíng tiān", "阴天": "yīn tiān", "雨天": "yǔ tiān", "雪": "xuě", "风": "fēng", "太阳": "tài yáng", "月亮": "yuè liang", "星星": "xīng xing", "云": "yún",
    
    // Countries
    "中国": "zhōng guó", "美国": "měi guó", "英国": "yīng guó", "法国": "fǎ guó", "德国": "dé guó", "日本": "rì běn", "韩国": "hán guó", "泰国": "tài guó", "新加坡": "xīn jiā pō", "澳大利亚": "ào dà lì yà",
    
    // Extended vocabulary for phrases
    "怎么": "zěn me", "为什么": "wèi shén me", "什么时候": "shén me shí hòu", "多长时间": "duō cháng shí jiān", "可以": "kě yǐ", "应该": "yīng gāi", "必须": "bì xū", "需要": "xū yào", "想要": "xiǎng yào",
    "也": "yě", "还": "hái", "都": "dōu", "只": "zhǐ", "就": "jiù", "才": "cái", "已经": "yǐ jīng", "正在": "zhèng zài", "马上": "mǎ shàng", "刚才": "gāng cái",
    "非常": "fēi cháng", "很": "hěn", "比较": "bǐ jiào", "特别": "tè bié", "太": "tài", "真": "zhēn", "挺": "tǐng", "相当": "xiāng dāng",
    
    // Question words and particles
    "吗": "ma", "呢": "ne", "吧": "ba", "啊": "a", "哦": "ó", "嗯": "ēn", "哪": "nǎ", "谁": "shéi", "哪个": "nǎ ge", "哪些": "nǎ xiē",
    
    // Additional travel and hotel vocabulary
    "预订": "yù dìng", "房间": "fáng jiān", "单人房": "dān rén fáng", "双人房": "shuāng rén fáng", "套房": "tào fáng", "钥匙": "yào shi", "电梯": "diàn tī", "楼层": "lóu céng", "前台": "qián tái", "服务": "fú wù",
    "入住": "rù zhù", "退房": "tuì fáng", "延期": "yán qī", "账单": "zhàng dān", "押金": "yā jīn", "发票": "fā piào", "收据": "shōu jù", "叫醒": "jiào xǐng",
    
    // More dining vocabulary
    "预约": "yù yuē", "位子": "wèi zi", "包间": "bāo jiān", "外卖": "wài mài", "打包": "dǎ bāo", "辣": "là", "甜": "tián", "酸": "suān", "苦": "kǔ", "咸": "xián", "鲜": "xiān",
    "素食": "sù shí", "清真": "qīng zhēn", "过敏": "guò mǐn", "特色": "tè sè", "推荐": "tuī jiàn", "招牌": "zhāo pái",
    
    // Emergency and health
    "急救": "jí jiù", "救护车": "jiù hù chē", "火警": "huǒ jǐng", "报警": "bào jǐng", "丢失": "diū shī", "偷": "tōu", "抢": "qiǎng", "保险": "bǎo xiǎn", "大使馆": "dà shǐ guǎn", "领事馆": "lǐng shì guǎn"
};

// Function to convert Chinese text to pinyin
function convertToPinyin(chineseText) {
    if (!chineseText || typeof chineseText !== 'string') {
        return '';
    }
    
    // First try direct lookup for common phrases
    if (CHINESE_PINYIN[chineseText]) {
        return CHINESE_PINYIN[chineseText];
    }
    
    // Try character by character conversion
    const characters = chineseText.split('');
    const pinyinParts = [];
    
    for (const char of characters) {
        if (CHINESE_PINYIN[char]) {
            pinyinParts.push(CHINESE_PINYIN[char]);
        } else if (/[\u4e00-\u9fff]/.test(char)) {
            // It's a Chinese character we don't have in our dictionary
            pinyinParts.push('?');
        } else {
            // It's not a Chinese character (punctuation, numbers, etc.)
            continue;
        }
    }
    
    return pinyinParts.length > 0 ? pinyinParts.join(' ') : '';
}

async function populateChinesePinyin() {
    try {
        console.log("Reading manifest...");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        let totalUpdated = 0;
        let filesUpdated = 0;
        let notFound = new Set();
        
        // Process Chinese useful phrases only
        if (manifest.chinese && manifest.chinese['Useful Phrases']) {
            const category = manifest.chinese['Useful Phrases'];
            if (category.lessons) {
                for (const lesson of category.lessons) {
                    const filePath = path.join(dataDir, lesson.file);
                    
                    if (!fs.existsSync(filePath)) {
                        console.warn(`File not found: ${filePath}`);
                        continue;
                    }
                    
                    const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    let fileModified = false;
                    
                    lessonData.forEach(card => {
                        if (card.chinese && (!card.pinyin || card.pinyin.trim() === '')) {
                            const pinyin = convertToPinyin(card.chinese);
                            if (pinyin && pinyin !== '?' && !pinyin.includes('?')) {
                                card.pinyin = pinyin;
                                fileModified = true;
                                totalUpdated++;
                            } else {
                                notFound.add(card.chinese);
                            }
                        }
                    });
                    
                    if (fileModified) {
                        fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2), 'utf8');
                        filesUpdated++;
                        console.log(`Updated: ${lesson.name} (${lesson.file})`);
                    }
                }
            }
        }
        
        console.log(`\nCompleted! Updated ${totalUpdated} cards across ${filesUpdated} files.`);
        
        if (notFound.size > 0) {
            console.log(`\nPhrases not found in dictionary (${notFound.size}):`);
            Array.from(notFound).slice(0, 20).forEach(phrase => {
                console.log(`  "${phrase}"`);
            });
            if (notFound.size > 20) {
                console.log(`  ... and ${notFound.size - 20} more`);
            }
        }
        
    } catch (error) {
        console.error("Error populating Chinese pinyin:", error);
    }
}

// Show statistics
function showPinyinStats() {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        let totalCards = 0;
        let withPinyin = 0;
        let emptyPinyin = 0;
        
        if (manifest.chinese && manifest.chinese['Useful Phrases']) {
            const category = manifest.chinese['Useful Phrases'];
            if (category.lessons) {
                for (const lesson of category.lessons) {
                    const filePath = path.join(dataDir, lesson.file);
                    if (fs.existsSync(filePath)) {
                        const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        lessonData.forEach(card => {
                            if (card.chinese) {
                                totalCards++;
                                if (card.pinyin && card.pinyin.trim()) {
                                    withPinyin++;
                                } else {
                                    emptyPinyin++;
                                }
                            }
                        });
                    }
                }
            }
        }
        
        console.log(`\nChinese Pinyin Statistics:`);
        console.log(`Total Chinese phrase cards: ${totalCards}`);
        console.log(`With pinyin: ${withPinyin} (${((withPinyin/totalCards)*100).toFixed(1)}%)`);
        console.log(`Missing pinyin: ${emptyPinyin} (${((emptyPinyin/totalCards)*100).toFixed(1)}%)`);
        console.log(`Dictionary size: ${Object.keys(CHINESE_PINYIN).length} entries`);
        
    } catch (error) {
        console.error("Error getting pinyin stats:", error);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--stats')) {
        showPinyinStats();
    } else {
        populateChinesePinyin();
    }
}

module.exports = { populateChinesePinyin, showPinyinStats, CHINESE_PINYIN };