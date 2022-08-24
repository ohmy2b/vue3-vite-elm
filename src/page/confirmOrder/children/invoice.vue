 <template>
    <div class="rating_page">
        <head-top head-title="选择发票抬头" go-back='true'></head-top>
        <section class="choose_invoice">
        	<span>不需要开发票</span>
        	<svg @click="chooseInvoice" :class="{choosed: invoice}">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#select"></use>
            </svg>
        </section>
        <div class="determine" @click="confrimInvoice">确定</div>
    </div>
</template>

<script>
    import {reactive,toRefs}from 'vue'
    import headTop from 'src/components/header/head'
    import {mapMutations,useStore} from 'vuex'
    import {useRouter} from 'vue-router'
    export default {
      name:'Invoice',
        components: {
            headTop,
        },
        props:[],
      setup(){
            const router=useRouter()
            const store=useStore()
            useMutation=store._mutations
            const state=reactive({
               	invoice: false, //是否需要发票
            })
            const chooseInvoice=()=>{
            	state.invoice = !state.invoice;
            }
            //保存发票信息
            const confrimInvoice=()=>{
            	useMutation.CONFIRM_INVOICE[0](state.invoice);
            	router.go(-1);
            }
            return {...toRefs(state),confrimInvoice,chooseInvoice}
        // methods: {
        //     ...mapMutations([
        //         'CONFIRM_INVOICE'
        //     ]),
            //是否选择发票
            // const chooseInvoice=()=>{
            // 	state.invoice = !state.invoice;
            // }
            // //保存发票信息
            // const confrimInvoice=()=>{
            // 	useMutation.CONFIRM_INVOICE[0](state.invoice);
            // 	router.go(-1);
            // }
        }
    }
</script>
  
<style lang="scss" scoped>
    @import 'src/style/mixin';
  
    .rating_page{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #f5f5f5;
        z-index: 204;
        padding-top: 1.95rem;
        p, span{
            font-family: Helvetica Neue,Tahoma,Arial;
        }
    }
    .choose_invoice{
		@include fj;
		align-items: center;
		background-color: #fff;
		line-height: 2.5rem;
		margin-top: 0.5rem;
		padding: 0 .7rem;
		span{
			@include sc(.75rem, #333);
		}
		svg{
			@include wh(.8rem, .8rem);
        	fill: #999;
		}
		.choosed{
			fill: #4cd964;
		}
    }
    .determine{
        background-color: #4cd964;
        @include sc(.7rem, #fff);
        text-align: center;
        margin: 0 .7rem;
        line-height: 1.8rem;
        border-radius: 0.2rem;
        margin-top: 0.5rem;
    }
    
</style>
