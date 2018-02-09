/*
* @Author: Pearl8
* @Date:   2018-02-07 16:54:21
* @Last Modified by:   Pearl8
* @Last Modified time: 2018-02-09 17:38:42
*/
/*
* @Author: Pearl8
* @Date:   2016-11-23 20:45:36
* @Last Modified by:   Pearl8
* @Last Modified time: 2018-02-08 11:32:19
*/

;(function(){
    'use strict';
    /*注意-和_的区别！！！*/
    var $form_add_task = $('.add-task')
        ,$task_delete_trigger
        ,$task_detail
        ,$task_detail_trigger
        ,$task_detail = $('.task-detail')
        ,$task_detail_mask = $('.task-detail-mask')
        ,task_list = []
        ,current_index
        ,$updata_form
        ,$task_detail_content
        ,$task_detail_content_input
        ;
     init();

    /*点击后执行函数*/
    $form_add_task.on('submit',on_add_task_form_submit);
    $task_detail_mask.on('click',hide_task_detail);

    /*点击button后获取新写的task值并存入到new_task，如果没写就返回，写了就执行下一个函数并更新页面和让输入框恢复原来样子*/
    function on_add_task_form_submit(e){
     var new_task = {},$input;
        /*禁用默认行为*/
        e.preventDefault();
        /*获取新task值*/
        $input = $(this).find('input[name=content]');
        new_task.content = $input.val();
        /*如果新Task值为空 则直接返回 否则继续执行*/
        if (!new_task.content) return;
        /*存入新task*/
        if (add_task(new_task)) {
            $input.val(null);
        }
    }
    /*监听打开Task详情事件*/
    function listen_task_detail(){
        var index
        $('.task-item').on('dblclick',function(){
            index = $(this).data('index');
            show_task_detail(index);
        })
      $task_detail_trigger.on('click', function() {
        var $this=$(this);
        var $item = $(this).parent().parent();
        index = $item.data('index');
        show_task_detail(index);
      });
    }

    /*查看Task详情*/
    function show_task_detail(index){
      /*生成模板详情*/
      render_task_detail(index);
      current_index = index;
      /*显示详情模板mask*/
      $task_detail.show(index);
      $task_detail_mask.show();
    }
    /*更新task*/
    function updata_task(index,data){
      if (!index || !task_list[index]) return;
      task_list[index] = data;
      refresh_task_list();
    }

    /*隐藏Task详情*/
    function hide_task_detail(index){
      $task_detail.hide();
      $task_detail_mask.hide();
    }

    /*渲染指定task的详细信息*/
    function render_task_detail(index){
      if (index === undefined || !task_list[index]) return;
      var item = task_list[index];
      var tpl =
        '<form>' +
        '<div class="content">' + item.content + '</div>' +
        '<div class="input-item"><input style="display:none" type="text" name="content" value="' + (item.content || '') + '"></div>' +
        '<div>' +
        '<div class="desc input-item">' +
        '<textarea name="desc">' +(item.desc || '')+ '</textarea>' +
        '</div>' +
        '</div>' +
        '<div class="remind input-item">' +
        '<input name="remind_date" type="date"  value="' + item.remind_date + '">' +
        '</div>' +
        '<div class="input-item"><button type="submit">更新</button></div>' +
        '</form>';
      /*用新模板替换旧模板 */
      $task_detail.html(null);
      $task_detail.html(tpl);
      /*选中其中的form元素，因为之后会使用其监听submit事件*/
      $updata_form = $task_detail.find('form');
      /*选中显示task内容的元素*/
      $task_detail_content = $updata_form.find('.content');
      /*选中显示task input的元素*/
      $task_detail_content_input = $updata_form.find('[name=content]');
      /*双击内容元素显示input*/
      $task_detail_content.on('dblclick', function() {
            $task_detail_content_input.show();
            $task_detail_content.hide();
      });

      $updata_form.on('submit', function(e) {
        e.preventDefault();
        var data = {};
        /*获取表单中各个input的值*/
        data.content = $(this).find('[name=content]').val();
        data.desc = $(this).find('[name=desc]').val();
        data.remind_date = $(this).find('[name=remind_date]').val();

        updata_task(index,data);
        hide_task_detail();
      });

    }

    /*查找并监听所有删除按钮的点击事件*/
    function listen_task_delete_trigger(){
      /*点击删除按钮会沿着这个按钮找到这一列task然后根据index数字知道要删除哪一列，发起提问是否删除，是就执行函数*/
      $task_delete_trigger.on('click', function() {
        var $this=$(this);
        /*找到删除按钮所在的task元素*/
        var $item = $(this).parent().parent();
        /*确认删除*/
        var  index = $item.data('index');
        var tmp = confirm('确定删除？')
        tmp ? task_delete_trigger(index) : null;
      });
    }

    /*将新写的task存入更新到store中*/
    function add_task(new_task){
        /*将新的task推入task_list*/
        task_list.push(new_task);
        /*更新localstorage*/
        refresh_task_list();
        return true;
    }

    /*刷新localstorage数据并渲染模板tpl*/
    function refresh_task_list(){
        store.set('task_list',task_list);
        render_task_list();
    }


    /*删除一条task*/
    function task_delete_trigger(index){
        /*如果没有index 或index不存在则直接返回*/
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();

    }

    /*获取store中的task-list，如果有就执行下一个函数让它展示*/
    function init(){
        // store.clear();
        task_list = store.get('task_list') || [];
        if (task_list.length) {
            render_task_list();

        };
    }

    /*渲染全部模板*/
    function render_task_list(){
        var $task_list = $('.task-list');
        $task_list.html('');
        for (var i = 0; i <task_list.length; i++) {
            var $task = render_task_item(task_list[i],i);
            $task_list.prepend($task);
        }
        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');
        listen_task_delete_trigger();
        listen_task_detail();
    }

    /*渲染单条task模板*/
    function render_task_item(data,index){
      if (!data || !index) return;
        var list_item_tpl =
        '<div class="task-item" data-index="' + index + '">' +
            '<span><input type="checkbox"></span>' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
                '<span class="action delete"> 删除</span>' +
                '<span class="action detail"> 详细</span>' +
            '</span>' +
        '</div>';
        return $(list_item_tpl);
    }


})();