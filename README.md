## git-cli 自动化cli工具分析
### 创建自己的feature分支
```
git checkout master
git pull
git checkout -b feature-迭代版本号
希望：git-cli "liyao"
```
### 发布测试环境
```
eg:当前分支为feature-3033333
git add .
git commit -m "feat: 描述"
git pull
如果远程没有当前分支 ? git push --set-upstream origin feature-3033333 : git push
git checkout develop
git pull
git merge feature-3033333
如果有冲突，报错退出
git push
希望：git-cli develop "描述"
```
### 发布预生产环境
```
eg:当前分支为feature-3033333
判断是有变更，有变更则提醒先发dev测试在做提交release
git checkout release
git pull
git merge feature-3033333
如果有冲突，报错退出
git push
希望：git-cli release
```
### 发布生产环境
```
注:发布生产使用master分支，只能从release分支合并
判断当前是否是relaese分支,不是则切换到release，git checkout release
git pull
git checkout master
git pull
git merge release
如果有冲突，报错退出
git push
git tag tagName
git push origin tagName
希望：git-cli master
```
### 优势：
* 将多个繁琐重复的git 命令浓缩为一个命令集合，缩短人为操作，减少错误发生。
* 减少新员工的理解成本，只需要理解少量的命令即可理解公司整个的git分支管理流程
* 规范公司整体的git分支管理流程，避免不同项目不同的分支习惯，难以做数据分析和统计
* 前后端通用


