import axios from 'axios';
import {handleId} from './../utils/tools.js'
class Tapd {
    constructor() {
        this.projects = [
            {title: '车核心',value:'chehexing',workspace_id:44955242}
        ];
        this.apis = [
            {title:'获取需求接口',key:'getStories',url:'https://api.tapd.cn/stories',method:'get'},
            {title:'获取迭代信息',key:'getIteration',url:'https://api.tapd.cn/iterations',method:'get'}
        ]
        this.currentProject = null
    }

    addProject(project) {
        this.projects.push(project);
    }
    async getData(apiKey,params={},options = {}){
        const apiObj = this.apis.find(item=>item.key === apiKey)
        if(!apiObj){
            throw new Error('apiKey is not exist')
        }
        const {url,method} = apiObj
        const opt = {
            url,
            method:method || 'post',
            headers:{
                'Authorization':`Basic ${process.env.TAPD_KEY}`
            },
            ...options
        }
        if(opt.method === 'get'){
            opt.params = params
        }else{
            opt.data = params
        }
        const {data} = await axios(opt)
        if(data.status ===1){
            return data.data
        }
        throw new Error(data.msg || '请求失败')
    }
    async getIteration(projectKey,params={},options={}){
        const project = this.getProject(projectKey)
        params = {
            workspace_id:project.workspace_id,
            ...params
        }
        const res = await this.getData('getIteration',params,options)
        if(res && res.length){
            return res[0].Iteration
        }
    }
    async getStories(projectKey,iteration,params={},options={}){
        const iterationObj = await this.getIteration(projectKey,{name:iteration})
        const project = this.getProject(projectKey)
        let result = []
        params = {
            workspace_id:project.workspace_id,
            iteration_id:iterationObj ? iterationObj.id:'',
            ...params
        }
        console.log(params,222)
        const res =await this.getData('getStories',params,options)
        if(res && res.length){
            result = res.map(item=>{
                console.log(item.Story)
                const {iteration_id,id,name} = item.Story
                return {
                    title:name,
                    id:handleId(id),
                    iteration_code:iteration
                }
            })

        }
        return result
        console.log(res,2222)

    }
   

    getProject(projectKey) {
        const project =  this.projects.find(item=>item.value === projectKey)
        if(!project){
            throw new Error('projectKey is not exist')
        }
        return project
    }
}
export default new Tapd()