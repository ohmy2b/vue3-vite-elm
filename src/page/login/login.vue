<template>
    <div class="loginContainer">
        <head-top :head-title="loginWay? '登录':'密码登录'" goBack="true">
            <!-- <div slot="changeLogin" class="change_login" @click="changeLoginWay">{{loginWay? "密码登录":"短信登录"}}</div> -->
        </head-top>
        <form class="loginForm" v-if="loginWay">
            <section class="input_container phone_number">
                <input type="text" placeholder="账号密码随便输入" name="phone" maxlength="11" v-model="phoneNumber">
                <button @click.prevent="getVerifyCode" :class="{right_phone_number:rightPhoneNumber}" v-show="!computedTime">获取验证码</button>
                <button  @click.prevent v-show="computedTime">已发送({{computedTime}}s)</button>
            </section>
            <section class="input_container">
                <input type="text" placeholder="验证码" name="mobileCode" maxlength="6" v-model="mobileCode">
            </section>
        </form>
        <form class="loginForm" v-else>
            <section class="input_container">
                <input type="text" placeholder="账号" v-model.lazy="userAccount">
            </section>
            <section class="input_container">
                <input v-if="!showPassword" type="password" placeholder="密码"  v-model="passWord">
                <input v-else type="text" placeholder="密码"  v-model="passWord">
                <div class="button_switch" :class="{change_to_text: showPassword}">
                    <div class="circle_button" :class="{trans_to_right: showPassword}" @click="changePassWordType"></div>
                    <span>abc</span>
                    <span>...</span>
                </div>
            </section>
            <section class="input_container captcha_code_container">
                <input type="text" placeholder="验证码" maxlength="4" v-model="codeNumber">
                <div class="img_change_img">
                    <img v-show="captchaCodeImg" :src="captchaCodeImg">
                    <div class="change_img" @click="getCaptchaCode">
                        <p>看不清</p>
                        <p>换一张</p>
                    </div>
                </div>
            </section>
        </form>
        <p class="login_tips">
            温馨提示：未注册过的账号，登录时将自动注册
        </p>
        <p class="login_tips">
            注册过的用户可凭账号密码登录
        </p>
        <div class="login_container" @click="mobileLogin">登录</div>
        <router-link to="/forget" class="to_forget" v-if="!loginWay">重置密码？</router-link>
        <alert-tip v-if="showAlert" :showHide="showAlert" @closeTip="closeTip" :alertText="alertText"></alert-tip>
    </div>
</template>

<script>
    import {reactive,toRefs,onMounted}from 'vue'
    import headTop from '../../components/header/head'
    import alertTip from '../../components/common/alertTip'
    import {localapi, proapi, imgBaseUrl} from 'src/config/env'
    import {useStore} from 'vuex'
    import {useRouter}from 'vue-router'
    import {mobileCode, checkExsis, sendLogin, getcaptchas, accountLogin} from '../../service/getData'
    export default {
        name:'Login',
        components: {headTop,alertTip},
        setup(){
            const store=useStore(),useMutation=store._mutations
            const router=useRouter()
            const state=reactive({
                loginWay: false, //登录方式，默认短信登录
                showPassword: false, // 是否显示密码
                phoneNumber: null, //电话号码
                mobileCode: null, //短信验证码
                validate_token: null, //获取短信时返回的验证值，登录时需要
                computedTime: 0, //倒数记时
                userInfo: null, //获取到的用户信息
                userAccount: null, //用户名
                passWord: null, //密码
                captchaCodeImg: null, //验证码地址
                codeNumber: null, //验证码
                showAlert: false, //显示提示组件
                alertText: null, //提示的内容
            })
            onMounted(()=>{getCaptchaCode()})
            rightPhoneNumber=computed(()=>/^1\d{10}$/gi.test(state.phoneNumber))
            //改变登录方式
            const changeLoginWay=()=>{
                state.loginWay = !state.loginWay;
            }
            //是否显示密码
            const changePassWordType=()=>{
                state.showPassword = !state.showPassword;
            }
            //获取验证吗，线上环境使用固定的图片，生产环境使用真实的验证码
            const getCaptchaCode=async()=>{
                let res = await getcaptchas();
                state.captchaCodeImg = res.code;
            }
            //获取短信验证码
            const getVerifyCode=async()=>{
                if (state.rightPhoneNumber) {
                    state.computedTime = 30;
                    state.timer = setInterval(() => {
                        state.computedTime --;
                        if (state.computedTime == 0) {
                            clearInterval(state.timer)
                        }
                    }, 1000)
                    //判读用户是否存在
                    let exsis = await checkExsis(state.phoneNumber, 'mobile');
                    if (exsis.message) {
                        state.showAlert = true;
                        state.alertText = exsis.message;
                        return
                    }else if(!exsis.is_exists) {
                        state.showAlert = true;
                        state.alertText = '您输入的手机号尚未绑定';
                        return
                    }
                    //发送短信验证码
                    let res = await mobileCode(state.phoneNumber);
                    if (res.message) {
                        state.showAlert = true;
                        state.alertText = res.message;
                        return
                    }
                    state.validate_token = res.validate_token;
                }
            }
            //发送登录信息
            const mobileLogin=async()=>{
                if (state.loginWay) {
                    if (!state.rightPhoneNumber) {
                        state.showAlert = true;
                        state.alertText = '手机号码不正确';
                        return
                    }else if(!(/^\d{6}$/gi.test(state.mobileCode))){
                        state.showAlert = true;
                        state.alertText = '短信验证码不正确';
                        return
                    }
                    //手机号登录
                    state.userInfo = await sendLogin(state.mobileCode, state.phoneNumber, state.validate_token);
                }else{
                    if (!state.userAccount) {
                        state.showAlert = true;
                        state.alertText = '请输入手机号/邮箱/用户名';
                        return
                    }else if(!state.passWord){
                        state.showAlert = true;
                        state.alertText = '请输入密码';
                        return
                    }else if(!state.codeNumber){
                        state.showAlert = true;
                        state.alertText = '请输入验证码';
                        return
                    }
                    //用户名登录
                    state.userInfo = await accountLogin(state.userAccount, state.passWord, state.codeNumber);
                }
                //如果返回的值不正确，则弹出提示框，返回的值正确则返回上一页
                if (!state.userInfo.user_id) {
                    state.showAlert = true;
                    state.alertText = state.userInfo.message;
                    if (!state.loginWay) state.getCaptchaCode();
                }else{
                    useMutation.RECORD_USERINFO[0](state.userInfo);
                    router.go(-1);

                }
            }
            const closeTip=()=>{
                state.showAlert = false;
            }
            return {...toRefs(state),changePassWordType,getCaptchaCode,mobileLogin,closeTip,changeLoginWay,getVerifyCode}
        // computed: {
        //     //判断手机号码
        //     rightPhoneNumber: function (){
        //         return /^1\d{10}$/gi.test(state.phoneNumber)
        //     }
        // },
        // methods: {
        //     ...mapMutations([
        //         'RECORD_USERINFO',
        //     ]),

        // }
    }
}

</script>

<style lang="scss" scoped>
    @import '../../style/mixin';

    .loginContainer{
        padding-top: 1.95rem;
        p, span, input{
            font-family: Helvetica Neue,Tahoma,Arial;
        }
    }
    .change_login{
        position: absolute;
        @include ct;
        right: 0.75rem;
        @include sc(.7rem, #fff);
    }

    .loginForm{
        background-color: #fff;
        margin-top: .6rem;
        .input_container{
            display: flex;
            justify-content: space-between;
            padding: .6rem .8rem;
            border-bottom: 1px solid #f1f1f1;
            input{
                @include sc(.7rem, #666);
            }
            button{
                @include sc(.65rem, #fff);
                font-family: Helvetica Neue,Tahoma,Arial;
                padding: .28rem .4rem;
                border: 1px;
                border-radius: 0.15rem;
            }
            .right_phone_number{
                background-color: #4cd964;
            }
        }
        .phone_number{
            padding: .3rem .8rem;
        }
        .captcha_code_container{
            height: 2.2rem;
            .img_change_img{
                display: flex;
                align-items: center;
                img{
                    @include wh(3.5rem, 1.5rem);
                    margin-right: .2rem;
                }
                .change_img{
                    display: flex;
                    flex-direction: 'column';
                    flex-wrap: wrap;
                    width: 2rem;
                    justify-content: center;
                    p{
                        @include sc(.55rem, #666);
                    }
                    p:nth-of-type(2){
                        color: #3b95e9;
                        margin-top: .2rem;
                    }
                }
            }
        }
    }
    .login_tips{
        @include sc(.5rem, red);
        padding: .4rem .6rem;
        line-height: .5rem;
        a{
            color: #3b95e9;
        }
    }
    .login_container{
        margin: 0 .5rem 1rem;
        @include sc(.7rem, #fff);
        background-color: #4cd964;
        padding: .5rem 0;
        border: 1px;
        border-radius: 0.15rem;
        text-align: center;
    }
    .button_switch{
        background-color: #ccc;
        display: flex;
        justify-content: center;
        @include wh(2rem, .7rem);
        padding: 0 .2rem;
        border: 1px;
        border-radius: 0.5rem;
        position: relative;
        .circle_button{
            transition: all .3s;
            position: absolute;
            top: -0.2rem;
            z-index: 1;
            left: -0.3rem;
            @include wh(1.2rem, 1.2rem);
            box-shadow: 0 0.026667rem 0.053333rem 0 rgba(0,0,0,.1);
            background-color: #f1f1f1;
            border-radius: 50%;
        }
        .trans_to_right{
            transform: translateX(1.3rem);
        }
        span{
            @include sc(.45rem, #fff);
            transform: translateY(.05rem);
            line-height: .6rem;
        }
        span:nth-of-type(2){
            transform: translateY(-.08rem);
        }
    }
    .change_to_text{
        background-color: #4cd964;
    }
    .to_forget{
        float: right;
        @include sc(.6rem, #3b95e9);
        margin-right: .3rem;
    }
</style>
