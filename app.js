const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ App running on port ${port}`);
});

// تفعيل السيشن
app.use(session({
    secret: 'your-secret-key', // غيّرها لقيمة قوية في البيئة
    resave: false,
    saveUninitialized: false
}));

// إعدادات القوالب والملفات الثابتة
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات (من خلال متغير البيئة)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });

// ==================== Routes ====================

// الصفحة الرئيسية
app.get('/', (req, res) => res.render('index'));

// تسجيل المستخدم
app.post('/register', async (req, res) => {
    const { email, password, name, gender, country, age } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("❌ هذا البريد الإلكتروني مسجل بالفعل.");
        }

        const hashedPassword = await bcrypt.hash(password, 10); // تشفير كلمة المرور

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            gender,
            country,
            age
        });

        await newUser.save();
        res.redirect('/exercises-one');
    } catch (err) {
        console.error(err);
        res.status(500).send("❌ حدث خطأ أثناء التسجيل.");
    }
});

// تسجيل الدخول
app.post('/levels', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.send("❌ لا يوجد مستخدم بهذا البريد.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("❌ كلمة المرور غير صحيحة.");
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/levels');
    } catch (err) {
        console.error(err);
        res.status(500).send("❌ حدث خطأ أثناء تسجيل الدخول.");
    }
});

// صفحة مستويات التمرين
app.get('/levels', (req, res) => {
    res.render('levels', {
        sets: 3,
        reps: 15,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1220344599-640_adpp_is.mp4'
    });
});

// تمارين المستويات المختلفة
app.get('/exercises-one', (req, res) => {
    const exercises = [
        {
            title: 'تمرين الضغط',
            img: 'https://images.unsplash.com/photo-1599058917215-6f82ec0c108e',
            desc: 'تقوية الصدر، الكتفين، والذراعين.'
        },
        {
            title: 'تمرين القرفصاء',
            img: 'https://images.unsplash.com/photo-1599058930487-0036e4c9d763',
            desc: 'لتقوية الساقين والأرداف وتحسين التوازن.'
        },
        {
            title: 'تمرين البلانك',
            img: 'https://images.unsplash.com/photo-1583454110551-21c1f33bcb8c',
            desc: 'يعزز عضلات البطن والظهر ويحسن الثبات الجسدي.'
        }
    ];
    res.render('exercises-one', { exercises });
});

app.get('/exercises-two', (req, res) => res.render('exercises-two'));
app.get('/exercises-three', (req, res) => res.render('exercises-three'));

// صفحة البروفايل
app.get('/profile', (req, res) => {
    if (!req.session?.user) return res.redirect('/');
    const { name, email } = req.session.user;
    res.render('profile', { name, email });
});

// تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// صفحات التمارين المفصلة
const workouts = [
    { route: 'pushups', reps: 15, video: 'istockphoto-1220344599-640_adpp_is.mp4' },
    { route: 'squats', reps: 20, video: 'istockphoto-1412656736-640_adpp_is.mp4' },
    { route: 'plank', duration: 60, video: 'istockphoto-1177443735-640_adpp_is.mp4' },
    { route: 'a', reps: 40, video: 'istockphoto-1179962862-640_adpp_is.mp4' },
    { route: 'jumping-jacks', reps: 60, video: '6326725-hd_1920_1080_25fps.mp4' },
    { route: 'mountain-climbers', reps: 60, video: 'istockphoto-1132958401-640_adpp_is.mp4' },
    { route: 'burpees', reps: 60, video: '8858142-uhd_3840_2160_25fps.mp4' },
    { route: 'proper-crunches', reps: 25, video: 'istockphoto-1007250098-640_adpp_is.mp4' },
    { route: 'Bicycle-crunches', reps: 25, video: 'istockphoto-1383508993-640_adpp_is.mp4' },
    { route: 'Side-Plank', reps: 60, video: '6023266-uhd_3840_2160_25fps.mp4' },
    { route: 'Leg-raises', reps: 60, video: '1103887_1080p_4k_3840x2160_2.mp4' },
    { route: 'Russian-twist', reps: 60, video: '5435382_Coll_wavebreak_People_3840x2160.mp4' }
];

workouts.forEach(({ route, reps = null, duration = null, video }) => {
    app.get(`/${route}`, (req, res) => {
        res.render(route, {
            sets: 3,
            reps,
            duration,
            rest: 30,
            videoSrc: `/images/videos/${video}`
        });
    });
});
