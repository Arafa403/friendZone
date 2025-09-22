const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

// تفعيل السيشن قبل أي Route
app.use(session({
    secret: 'your-secret-key', // غيّرها لقيمة سرية قوية فعلًا
    resave: false,
    saveUninitialized: false
}));

// إعدادات القوالب والملفات الثابتة
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
mongoose.connect("mongodb+srv://Arafa:Arafa123@cluster0.zdjypgk.mongodb.net/3rafa_data?retryWrites=true&w=majority")
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });

// الصفحة الرئيسية
app.get('/', (req, res) => res.render('index'));

// تسجيل المستخدم (مرة واحدة فقط لكل إيميل)
app.post('/register', async (req, res) => {
    const { email, password, name, gender, country, age } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("❌ هذا البريد الإلكتروني مسجل بالفعل. استخدم صفحة تسجيل الدخول.");
        }

        const newUser = new User({
            email,
            password,  // بدون تشفير
            name,
            gender,
            country,
            age
        });

        await newUser.save();
        res.redirect('/exercises');  // بعد التسجيل يروح لصفحة التمارين
    } catch (err) {
        if (err.code === 11000) {
            res.send("❌ البريد الإلكتروني مستخدم بالفعل.");
        } else {
            console.error(err);
            res.status(500).send("❌ حدث خطأ أثناء التسجيل.");
        }
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

        // حفظ بيانات المستخدم في السيشن
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        // توجيه المستخدم لصفحة التمارين بعد تسجيل الدخول
        res.redirect('/levels');
    } catch (err) {
        console.error(err);
        res.status(500).send("❌ حدث خطأ أثناء تسجيل الدخول.");
    }
});



app.get('/levels', (req, res) => {
    res.render('levels', {
        sets: 3,
        reps: 15,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1220344599-640_adpp_is.mp4' // أو رابط خارجي
    });
});


app.get('/levels', (req, res) => {
    res.render('levels'); // أو ملف EJS/Pug المناسب
});


// صفحة التمارين
app.get('/exercises-one', (req, res) => {
    const exercises = [
        {
            title: 'تمرين الضغط',
            img: 'https://images.unsplash.com/photo-1599058917215-6f82ec0c108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'تقوية الصدر، الكتفين، والذراعين.'
        },
        {
            title: 'تمرين القرفصاء',
            img: 'https://images.unsplash.com/photo-1599058930487-0036e4c9d763?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'لتقوية الساقين والأرداف وتحسين التوازن.'
        },
        {
            title: 'تمرين البلانك',
            img: 'https://images.unsplash.com/photo-1583454110551-21c1f33bcb8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'يعزز عضلات البطن والظهر ويحسن الثبات الجسدي.'
        }
    ];
    res.render('exercises-one', { exercises });
});


app.get('/exercises-two', (req, res) => {
    const exercises = [
        {
            title: 'تمرين الضغط',
            img: 'https://images.unsplash.com/photo-1599058917215-6f82ec0c108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'تقوية الصدر، الكتفين، والذراعين.'
        },
        {
            title: 'تمرين القرفصاء',
            img: 'https://images.unsplash.com/photo-1599058930487-0036e4c9d763?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'لتقوية الساقين والأرداف وتحسين التوازن.'
        },
        {
            title: 'تمرين البلانك',
            img: 'https://images.unsplash.com/photo-1583454110551-21c1f33bcb8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'يعزز عضلات البطن والظهر ويحسن الثبات الجسدي.'
        }
    ];
    res.render('exercises-two', { exercises });
});





app.get('/exercises-three', (req, res) => {
    const exercises = [
        {
            title: 'تمرين الضغط',
            img: 'https://images.unsplash.com/photo-1599058917215-6f82ec0c108e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'تقوية الصدر، الكتفين، والذراعين.'
        },
        {
            title: 'تمرين القرفصاء',
            img: 'https://images.unsplash.com/photo-1599058930487-0036e4c9d763?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'لتقوية الساقين والأرداف وتحسين التوازن.'
        },
        {
            title: 'تمرين البلانك',
            img: 'https://images.unsplash.com/photo-1583454110551-21c1f33bcb8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            desc: 'يعزز عضلات البطن والظهر ويحسن الثبات الجسدي.'
        }
    ];
    res.render('exercises-three', { exercises });
});

// صفحة البروفايل - تحمي الصفحة بحيث لا يمكن الوصول بدون تسجيل دخول
app.get('/profile', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/');
    }

    const { name, email } = req.session.user;

    res.render('profile', { name, email });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});



app.get('/pushups', (req, res) => {
    res.render('pushups', {
        sets: 3,
        reps: 15,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1220344599-640_adpp_is.mp4' // أو رابط خارجي
    });
});



app.get('/squats', (req, res) => {
    res.render('squats', {
        sets: 3,
        reps: 20,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1412656736-640_adpp_is.mp4' // أو رابط خارجي
    });
});



app.get('/plank', (req, res) => {
    res.render('plank', {
        sets: 3,
        duration: 60,   // مدة كل مجموعة بالثواني
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1177443735-640_adpp_is.mp4'
    });
});



app.get('/a', (req, res) => {
    res.render('a', {
        sets: 3,
        reps: 40,         // عدد التكرارات لازم يتضاف هنا
        duration: 60,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1179962862-640_adpp_is.mp4'
    });
});




app.get('/jumping-jacks', (req, res) => {
    res.render('jumping-jacks', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        duration: 60,
        rest: 30,
        videoSrc: '/images/videos/6326725-hd_1920_1080_25fps.mp4'
    });
});





app.get('/mountain-climbers', (req, res) => {
    res.render('mountain-climbers', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        duration: 60,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1132958401-640_adpp_is.mp4'
    });
});





app.get('/burpees', (req, res) => {
    res.render('burpees', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        duration: 60,
        rest: 30,
        videoSrc: '/images/videos/8858142-uhd_3840_2160_25fps.mp4'
    });
});





app.get('/proper-crunches', (req, res) => {
    res.render('proper-crunches', {
        sets: 3,
        reps: 25,         // عدد التكرارات لازم يتضاف هنا
        duration: 60,
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1007250098-640_adpp_is.mp4'
    });
});




app.get('/Bicycle-crunches', (req, res) => {
    res.render('Bicycle-crunches', {
        sets: 3,
        reps: 25,         // عدد التكرارات لازم يتضاف هنا
        rest: 30,
        videoSrc: '/images/videos/istockphoto-1383508993-640_adpp_is.mp4'
    });
});




app.get('/Side-Plank', (req, res) => {
    res.render('Side-Plank', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        rest: 30,
        videoSrc: '/images/videos/6023266-uhd_3840_2160_25fps.mp4'
    });
});




app.get('/Leg-raises', (req, res) => {
    res.render('Leg-raises', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        rest: 30,
        videoSrc: '/images/videos/1103887_1080p_4k_3840x2160_2.mp4'
    });
});




app.get('/Russian-twist', (req, res) => {
    res.render('Russian-twist', {
        sets: 3,
        reps: 60,         // عدد التكرارات لازم يتضاف هنا
        rest: 30,
        videoSrc: '/images/videos/5435382_Coll_wavebreak_People_3840x2160.mp4'
    });
});



