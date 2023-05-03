import { exec } from 'child_process'
import { promptType } from './../utils/inquirerTools.js'
import inquirer from 'inquirer'
import { log } from './../utils/tools.js'
import tapd from './../tapd/Tapd.js';
class GitTools {
	constructor(option) {
		this.option = option;
		this.currentBranch = ''
		this.branchList = []
		this.lastBranch = ''
		this.isExist = false
		this.tapd = option.tapd
		this.mergeBranchs = []
	}

	/**
	 * git add
	 * */
	add() {
		const params = 'git add .'
		return this.startChildProcess(params);
	}

	/**
	 * git commit
	 * @param {String} remark 备注信息
	 * */
	async commit({ commit }) {
		if (!commit) {
			commit = (await promptType('commit')).commit
		}
		const params = `git commit -m "${commit}"`
		return this.startChildProcess(params);
	}
	/**
	 * git push
	 * @param {String} branch 分支名
	 * */
	async push({ branch }) {
		const params = branch ? `git push origin ${branch}` : 'git push'
		await this.startChildProcess(params);
	}

	/**
	 * git checkout
	 * @param {String} branch 分支名
	 * */
	async checkout({ branch }) {
		if (!branch) {
			branch = (await promptType('branch')).branch
		}
		const params = `git checkout ${branch}`
		const currentBranch = await this.getCurrentBranch()
		if (branch !== currentBranch) {
			const isChange = await this.status()
			if (isChange) {
				log('error', `当前有修改未提交无法切换分支!`)
				return
			}
			await this.startChildProcess(params);
			this.lastBranch = currentBranch
		} else {
			log('warning', `当前分支已经是${branch}`)
		}
	}
	async remote({ remoteName, remoteUrl }) {
		remoteName = remoteName || 'origin'
		console.log(remoteUrl)
		if (!remoteUrl) {
			remoteUrl = (await promptType('remoteUrl')).remoteUrl
		}
		const params = `git remote add ${remoteName} ${remoteUrl}`
		console.log(params)
		return this.startChildProcess(params);
	}
	/**
	 * 判断远程分支是否存在该分支
	 * @param {分支名} branch 
	 **/
	async isRemoteExistBranch(branch) {
		if (!branch) return
		const params = `git branch -r | grep origin/${branch}`
		const isExist = await this.startChildProcess(params);
		this.isExist = !!isExist
		return !!isExist
	}
	/**
	 * git pull
	 * @param {String} branch 分支名
	 * */
	pull({ branch }) {
		const params = branch ? `git pull origin ${branch}` : 'git pull'
		return this.startChildProcess(params);
	}

	/**
	 * git pull
	 * @return {Boolean} 是否存在修改
	 * */
	async status() {
		try {
			const params = 'git status -s'
			let result = await this.startChildProcess(params);
			return !!result
		} catch (err) {
			log('error', error)
		}
		return false;
	}
	async merge({ branch, commit, isPush = false }) {
		try {
			if (!branch) {
				branch = (await promptType('branch')).branch
			}
			const params = commit ? `git merge ${branch}` : `git merge ${branch} -m ${commit}`
			const stdout = await this.startChildProcess(params);
			const isContinue = await this.handleConflict(stdout, branch);
			if (isContinue && isPush) {
				this.push()
			}
		} catch (error) {
			log('error', error)
		}
	}
	/**
	 * git branch
	 * @return {String} currentBranch 当前分支
	 * @return {Array} branchList 当前本地所有分支
	 * */
	async getCurrentBranch() {
		const params = 'git branch'
		const result = await this.startChildProcess(params);
		let currentBranch = '';
		const branchList = result.split('\n').map(item => {
			var reg = new RegExp(/\*/g);
			if (reg.test(item)) {
				item = item.replace(reg, '');
				currentBranch = item.trim();
			}
			return item.trim();
		}).filter(item => item);
		this.branchList = branchList
		log('success', `当前分支:${currentBranch}`)
		return currentBranch
	}
	/**
	 * 
	 * @param {要切换的分支} branch 
	 * @param {远程分支} serveBranch
	 * @returns 
	 */
	async newBranch({ branch, serveBranch }) {
		try {
			if (!branch) {
				branch = (await promptType('branch')).branch
			}
			serveBranch || (serveBranch = branch)
			const isChange = await this.status()
			if (isChange) {
				log('error', `当前有修改未提交无法切换并新建分支!`)
				return
			}
			const params = `git checkout -b ${branch} origin/${serveBranch}`
			await this.startChildProcess(params)
			await this.pull({ branch })
		} catch (error) {
			log('error', error)
		}
	}
	/**
	 * 
	 * @param {项目key,eg:'chehexin'} projectKey 
	 * @param {迭代标题：eg:'20230430'} iteration
	 */
	async mergeBranch({ projectKey, iteration }) {
		try {
			if (!projectKey) {
				projectKey = (await promptType('projectKey')).projectKey
			}
			if (!iteration) {
				iteration = (await promptType('iteration')).iteration
			}
			const stories = await this.tapd.getStories(projectKey, iteration, { status: 'status_18' })
			for (let i = 0; i < stories.length; i++) {
				const { id, title } = stories[i]
				this.mergeBranchs.push(`feature-${id}`)
				const result = await this.merge({ branch: `origin/feature-${id}`, commit: `"${this.currentBranch}_${id}${title}"` })
				if (!result) {
					break
				}
			}
			this.push()
		} catch (error) {
			log('error', error)
		}
	}
	/**
	 * 处理合并冲突
	 * @param {} stdout 
	 * @returns {boolean}
	 */
	async handleConflict(stdout, branch) {
		const conflictRegex = /CONFLICT \([\w\s]+\): Merge conflict in (.+)/g;
		const errFiles = conflictRegex.exec(stdout);
		if (!errFiles) {
			return false;
		}
		log('warning', `冲突文件: ${errFiles[1]}`);
		log('warning', `冲突分支：${branch}`)
		const { continueMerge } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'continueMerge',
				message: `${branch}合并冲突，请修改后继续合并，是否继续合并?`,
				default: true,
			},
		]);
		if (continueMerge) {
			const conflictedFiles = await this.getConflictedFiles()
			if(conflictedFiles.length ===0){
				await this.add()
				await this.commit({ commit: 'resolve conflicts' })
			}
		} else {
			log('warning', '合并已终止');
		}
		return continueMerge
	}
	async getConflictedFiles() {
		const params = 'git ls-files -u'
		const output =await this.startChildProcess(params);
		const lines = output.split('\n').filter(line => line !== '');
		const conflictedFiles = lines.map(line => line.split('\t')[-1]);
		conflictedFiles.forEach(file => {
			log('warning', `未解决的冲突文件: ${file}`);
		});
		return conflictedFiles;
	  }

	/**
	 * 切换分支并拉取最新代码
	 * @param {String} branch 目标分支 
	 * */
	async switchBreach({ branch }) {
		try {
			// 切分支
			await this.checkout({ branch });

			// 拉取最新代码
			await this.pull(branch);

			return true;

		} catch (err) {
			log('error', err)
		}

		return false;
	}

	/**
	 * 自动上传
	 * @param {String} remark 备注的信息 
	 * @param {String} branch 目标分支 
	 * */
	async autoPush({ commit, serveBranch }) {
		try {
			const currentBranch = await this.getCurrentBranch()
			const isExist = await this.isRemoteExistBranch(currentBranch)
			log('success', '开始了')
			// git add .
			await this.add();

			// git status -s
			var isChange = await this.status();

			if (isChange) {
				// 提交备注
				await this.commit({ commit });
				// git pull branch
				if (isExist) {
					await this.pull({ branch: currentBranch });
				}
				await this.push({ branch: isExist ? currentBranch : 'HEAD' });
				// 切换分支
				await this.checkout({ branch: serveBranch })

				await this.pull({ branch: serveBranch })
				// 合并分支
				await this.merge({ branch: this.lastBranch })
				await this.push({})
			} else {
				log('success', 'not have to upload');
			}
			log('success', 'auto upload success !');
			return true;
		} catch (err) {
			log('error', err)
		}
		return false;
	}
	execSync(params) {
		return new Promise((resolve, reject) => {
			exec(params, (err, stdout, stderr) => {
				resolve({ err, stdout })
			});
		});
	}
	/**
 * 开启子进程
 * @param {String} command  命令 (git/node...)
 * @param {Array} params 参数
 * */
	async startChildProcess(params) {
		try {
			const { err, stdout } = await this.execSync(params);
			if (err) {
				log('error', `执行：${params}`)
				log('error', err)
			} else {
				log('success', `执行：${params}`)
			}
			stdout && log('white', `输出：${stdout}`)
			return stdout
		} catch (err) {
			log('error', err)
		}
	}
}
const gitTools = new GitTools(tapd);
export default gitTools;
