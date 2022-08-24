 <template>
  <div class="rating_page">
        <head-top head-title="新增地址" go-back='true'></head-top>
        <section class="adddetail">
        	<form action="" v-on:submit.prevent>
        		<section class="ui-padding-block">
        			<div class="input-new">
        				<input type="text" placeholder="请填写你的姓名" :class="{verifies:verify}" v-model="message" @input="inputThing">
        				<p v-if="verify">请填写您的姓名</p>
        			</div>
        			<router-link to='/profile/info/address/add/addDetail' class="add-detail">
	        			<div class="input-new">
	        				<input type="text" placeholder="小区/写字楼/学校等" readonly="readonly" v-model="addAddress" />
	        			</div>
        			</router-link>
        			 <div class="input-new">
        				<input type="text" placeholder="请填写详细送餐地址" :class="{verifies:verifythree}" @input="inputThingthree" v-model="mesthree"/>
        				<p v-if="verifythree">{{sendaddress}}</p>
        			</div>
        			<div class="input-new">
        				<input type="text" placeholder="请填写能够联系到您的手机号" :class="{verifies:verifyfour}" v-model="telenum" @input="inputThingfour" />
        				<p v-if="verifyfour">{{telephone}}</p>
        			</div>
        			<div class="input-new">
        				<input type="text" placeholder="备用联系电话（选填）" v-model="standbytelenum" @input="inputThingfive" />
        				<p v-if="verifyfive">{{standbytele}}</p>
        			</div>
        		</section>
        		<section class="addbutton">
        			<button :class="{butopacity:butpart}" @click.prevent="submitThing">新增地址</button>
        		</section>
        	</form>
        </section>
        <transition name="router-slid" mode="out-in">
            <router-view></router-view>
        </transition>
        <alert-tip v-if="showAlert" @closeTip="showAlert = false" :alertText="alertText"></alert-tip>
    </div>
</template>

<script>
	import {computed,reactive,toRefs} from 'vue'
	import {useRouter}from 'vue-router'
    import headTop from 'src/components/header/head'
    import {getImgPath} from 'src/components/common/mixin'
    import {mapState, mapMutations,useStore} from 'vuex'
    import {postAddAddress} from 'src/service/getData'
    import alertTip from 'src/components/common/alertTip'


    export default {
	  name:'Add',
        mixins: [getImgPath],
        components: {headTop,alertTip,},
      setup(){
			const store=useStore(),useMutation=store._mutations
			const router=useRouter()
            const state=reactive({
    			verify:false,			//姓名
    			verifytwo:false,		//备注
    			verifythree:false,		//地址
    			verifyfour:false,		//电话
    			verifyfive:false,		//备用电话
    			butpart:false,			//新增地址按钮的透明度
    			sendaddress:'',  //地址
    			message:'', //信息
    			mesthree:'', //送餐地址
    			telenum:'', //手机号
    			telephone:'', //手机号提示
    			standbytele:'', //备用手机号提示 
    			standbytelenum:'', //备用手机号
    			addSearch:false, //添加搜索地址
    			newAddress:{},			//增加数组的元素
                showAlert: false, //弹出框
                alertText: null, //弹出信息
				userInfo:store.state.userInfo,
				addAddress:store.state.addAddress,
				removeAddress:store.state.removeAddress
            })
			const inputThing=()=>{
            	(!state.message) ? state.verify=true : state.verify=false;
            	bindThing()
            }
            //输入地址
            const inputThingthree=()=>{
            	state.verifythree=true;
            	if(state.mesthree.length == 0){
            		state.sendaddress='请详细填写送餐地址';
            		
            	}else if(state.mesthree.length > 0 && state.mesthree.length <= 2){
            		state.sendaddress='送餐地址太短了，不能辨识';
            	}else{
            		state.sendaddress='';
            		state.verifythree=false;
            	}
            	bindThing()	
            }
            //输入手机号
            const inputThingfour=()=>{
            	state.verifyfour=true;
            	if((/^[1][358][0-9]{9}$/).test(state.telenum)){
            		state.verifyfour=false;
            	}else if(state.telenum == ''){
            		state.telephone="手机号不能为空"
            	}else{
            		state.telephone="请输入正确的手机号"
            	}
            	bindThing()
            }
            //输入备注手机号
            const inputThingfive=()=>{
            	state.verifyfive=true;
            	if((/^[1][358][0-9]{9}$/).test(state.standbytelenum) || state.standbytelenum == ''){
            		state.verifyfive=false;
            	}else{
            		state.standbytele="请输入正确的手机号"
            	}
            	bindThing();
            }
            const bindThing=()=>{
            	if(state.message && state.mesthree && !state.verifyfour){
            		state.butpart=true;
            	}else{
            		state.butpart=false;
            	}
            }
            //保存地址
            const submitThing=async()=>{
                let res = await postAddAddress(state.userInfo.user_id, state.mesthree, state.addAddress, state.geohash, state.message, state.telenum, state.standbytelenum, 0, 1, '公司', 4);
                if (res.message) {
                    state.showAlert = true;
                    state.alertText = res.message;
                }else if(state.butpart){
                    //保存的地址存入vuex
            		useMutation.ADD_ADDRESS({
                        name: state.message,
                        address: state.mesthree,
                        address_detail: state.addAddress,
                        geohash: 'wtw37r7cxep4',
                        phone: state.telenum,
                        phone_bk: state.standbytelenum,
                        poi: state.addAddress,
                        poi_type: 0,
                    });
            		router.go(-1);
                }
            }
			return {...toRefs(state),submitThing,inputThing,inputThingthree,inputThingfour,inputThingfive}
        },

        // mixins: [getImgPath],
        // components: {headTop,alertTip,},
        // computed:{
        //      ...mapState([
        //         'userInfo', 'addAddress','removeAddress','newAddress', 'geohash'
        //     ]),
            
        // },
        // props:[],
        // methods: {
        // 	...mapMutations([
        //     	'ADD_ADDRESS'
        //     ]),
        //     const inputThing=()=>{
        //     	(!state.message) ? state.verify=true : state.verify=false;
        //     	bindThing()
        //     },
        //     //输入地址
        //     const inputThingthree=()=>{
        //     	state.verifythree=true;
        //     	if(state.mesthree.length == 0){
        //     		state.sendaddress='请详细填写送餐地址';
            		
        //     	}else if(state.mesthree.length > 0 && state.mesthree.length <= 2){
        //     		state.sendaddress='送餐地址太短了，不能辨识';
        //     	}else{
        //     		state.sendaddress='';
        //     		state.verifythree=false;
        //     	}
        //     	bindThing()	
        //     },
        //     //输入手机号
        //     const inputThingfour=()=>{
        //     	state.verifyfour=true;
        //     	if((/^[1][358][0-9]{9}$/).test(state.telenum)){
        //     		state.verifyfour=false;
        //     	}else if(state.telenum == ''){
        //     		state.telephone="手机号不能为空"
        //     	}else{
        //     		state.telephone="请输入正确的手机号"
        //     	}
        //     	bindThing()
        //     },
        //     //输入备注手机号
        //     const inputThingfive=()=>{
        //     	state.verifyfive=true;
        //     	if((/^[1][358][0-9]{9}$/).test(state.standbytelenum) || state.standbytelenum == ''){
        //     		state.verifyfive=false;
        //     	}else{
        //     		state.standbytele="请输入正确的手机号"
        //     	}
        //     	bindThing();
        //     },
        //     const bindThing=()=>{
        //     	if(state.message && state.mesthree && !state.verifyfour){
        //     		state.butpart=true;
        //     	}else{
        //     		state.butpart=false;
        //     	}
        //     },
        //     //保存地址
        //     const submitThing=async()=>{
        //         let res = await postAddAddress(state.userInfo.user_id, state.mesthree, state.addAddress, state.geohash, state.message, state.telenum, state.standbytelenum, 0, 1, '公司', 4);
        //         if (res.message) {
        //             state.showAlert = true;
        //             state.alertText = res.message;
        //         }else if(state.butpart){
        //             //保存的地址存入vuex
        //     		useMutation.ADD_ADDRESS({
        //                 name: state.message,
        //                 address: state.mesthree,
        //                 address_detail: state.addAddress,
        //                 geohash: 'wtw37r7cxep4',
        //                 phone: state.telenum,
        //                 phone_bk: state.standbytelenum,
        //                 poi: state.addAddress,
        //                 poi_type: 0,
        //             });
        //     		router.go(-1);
        //         }
        //     }
        // }
    }
</script>
  
<style lang="scss" scoped>
    @import 'src/style/mixin';
  	.router-slid-enter-active, .router-slid-leave-active {
  	    transition: all .4s;
  	}
  	.router-slid-enter, .router-slid-leave-active {
  	    transform: translate3d(2rem, 0, 0);
        opacity: 0;
  	}
    .rating_page{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #f2f2f2;
        z-index: 202;
        padding-top: 1.95rem;
        p, span{
            font-family: Helvetica Neue,Tahoma,Arial;
        }
    }
    .adddetail{
    	margin-top:.4rem;
    }
    .ui-padding-block{
    	background:#fff;
    	padding-top:.4rem;
    	.add-detail{display:block;}
    	.input-new{
    		padding-bottom:.4rem;
    		input{
    			display:block;
    			width:15rem;
    			font-size:.6rem;
    			margin:0 auto;
    			padding:.3rem;
    			background:#f2f2f2;
    			border:1px solid #ddd;
    			@include borderRadius(3px);
    		}
    		.verifies{
				border-color:#ea3106;
    		}
    		p{
				@include sc(.4rem,#ea3106);
				padding-left:.5rem;
				margin-top:.2rem;
    		}
    	}
    	
    }
    .addbutton{
    	margin:.6rem auto;
    	width:15rem;
    	background:#4cd964;
    	@include borderRadius(3px);
    	button{
    		width:100%;
    		@include sc(.6rem,#fff);
    		line-height:1.6rem;
    		background:none;
    		font-weight:700;
    		opacity:.6;
    	}
    	.butopacity{
    		transition: all .4s;
    		opacity:1;
    	}
    }
</style>
