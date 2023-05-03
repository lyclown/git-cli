import inquirer from 'inquirer'
import {projects} from './../config/index.js'
const options = {
	'checkout (切分支)': 'checkout',
	'pull (拉取代码)': 'pull',
	'add (添加暂存区)': 'add',
	'commit (提交)': 'commit',
	'push (推送)': 'push',
	'status (修改状态)': 'status',
	'branch (查看分支)': 'branch',
	'switchBreach (切换分支并拉取最新代码)': 'switchBreach',
	'自动推送并合并修改到目标分支': 'autoPush',
    "新建分支":'newBranch',
    "关联远程仓库":'remote',
}
const promptOption = {
    commit: {
        type: 'input',
        name: 'commit',
        message: '请输入备注信息'
    },
    branch:{
        type: 'input',
        name: 'branch',
        message: '请输入一个分支名'
    },
    iteration:{
        type: 'input',
        name: 'iteration',
        message: '请输入迭代号，eg:"20230420"'
    },
    remoteUrl:{
        type: 'input',
        name: 'remoteUrl',
        message: '请输入远程仓库地址'
    },
    type:{
        type:'list',
        name:'type',
        message:'请选择你要进行的操作',
        choices:Object.keys(options).map(x=>({name:x,value:options[x]}))
    },
    projectKey:{
        type:'list',
        name:'projectKey',
        message:'请选择项目名',
        choices:projects.map(x=>({name:x.title,value:x.value}))
    }
}

export const promptType = async (type)=>{
    if(!promptOption[type])return
    const result = await inquirer.prompt([promptOption[type]])
    return result
}