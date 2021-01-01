odoo.define('ks_dashboard_ninja.ks_dashboard', function (require) {
    "use strict";

    var core = require('web.core');
    var Dialog = require('web.Dialog');
    // var viewRegistry = require('web.view_registry');

    var _t = core._t;
    var QWeb = core.qweb;

    // var framework = require('web.framework');
    var time = require('web.time');

    // var AbstractAction = require('web.AbstractAction');
    var Widget = require('web.Widget');

    var ajax = require('web.ajax');
    var ControlPanelMixin = require('web.ControlPanelMixin');
    // var View = require('web.View');
    var AbstractWebClient = require('web.AbstractWebClient');
    
    // var framework = require('web.framework');
    // var crash_manager = require('web.crash_manager');
    var field_utils = require('web.utils');

    // var KsQuickEditView = require('ks_dashboard_ninja.quick_edit_view');

    var KsDashboardNinja = Widget.extend(ControlPanelMixin, {
        // To show or hide top control panel flag.
        need_control_panel: false,

        /**
         * @override
         */

        jsLibs: ['/ks_dashboard_ninja/static/lib/js/jquery.ui.touch-punch.min.js',
            '/ks_dashboard_ninja/static/lib/js/html2canvas.js',
            '/ks_dashboard_ninja/static/lib/js/jsPDF.js',
            '/ks_dashboard_ninja/static/lib/js/Chart.js',
                '/ks_dashboard_ninja/static/lib/js/Chart.min.js',
                '/ks_dashboard_ninja/static/lib/js/Chart.bundle.min.js',
                '/ks_dashboard_ninja/static/lib/js/Chart.bundle.js',
                '/ks_dashboard_ninja/static/lib/js/gridstack.min.js',
                '/ks_dashboard_ninja/static/lib/js/gridstack.jQueryUI.min.js',
        ],
        cssLibs: ['/ks_dashboard_ninja/static/lib/css/Chart.css',
                '/ks_dashboard_ninja/static/lib/css/Chart.min.css'],

        on_attach_callback: function () {
            var self = this;
            $.when(self.ks_fetch_data()).then(function () {
                self.ksRenderDashboard("on_attach_callback");
            });
            self.ks_set_update_interval();
            // console.log('on_attach_callback');

        },

        ks_set_update_interval : function(){
            var self = this;
            if (self.ks_dashboard_data.ks_set_interval){
                // console.log('ks_dashboard_data.ks_set_interval');
                function ksUpdateInterval() {
                    $.when(self.ks_fetch_data()).then(function () {
                            self.ksUpdateDashboardItem(Object.keys(self.ks_dashboard_data.ks_item_data));
                        });
                }
                self.ksUpdateDashboard = setInterval(ksUpdateInterval, self.ks_dashboard_data.ks_set_interval);
            }
        },
        on_detach_callback : function(){
            var self = this;
            self.ks_remove_update_interval();
            // console.log('on_detach_callback');
        },

        ks_remove_update_interval : function(){
            var self = this;
            if (self.ks_dashboard_data.ks_set_interval){
                clearInterval(self.ksUpdateDashboard)
            }
        },
        events: {
            'click #ks_add_item_selection > li': 'onAddItemTypeClick',
            'click .ks_dashboard_add_layout': '_onKsAddLayoutClick',
            'click .ks_dashboard_edit_layout': '_onKsEditLayoutClick',
            'click .ks_dashboard_select_item': 'onKsSelectItemClick',
            'click .ks_dashboard_save_layout': '_onKsSaveLayoutClick',
            'click .ks_dashboard_cancel_layout': '_onKsCancelLayoutClick',
            'click .ks_item_click': '_onKsItemClick',
            //            'click .ks_dashboard_item_action': '_onKsItemActionClick',
            'click .ks_dashboard_item_customize': '_onKsItemCustomizeClick',
            'click .ks_dashboard_item_delete': '_onKsDeleteItemClick',
            'change .ks_dashboard_header_name': '_onKsInputChange',
            'click .ks_duplicate_item': 'onKsDuplicateItemClick',
            'click .ks_move_item': 'onKsMoveItemClick',
            'click .ks_dashboard_menu_container': function (e) {
                e.stopPropagation();
            },
            'click .ks_qe_dropdown_menu': function (e) {
                e.stopPropagation();
            },
            'click .ks_dashboard_item_action': 'ksStopClickPropagation',
            'show.bs.dropdown .ks_dropdown_container': 'onKsDashboardMenuContainerShow',
            'hide.bs.dropdown .ks_dashboard_item_button_container': 'onKsDashboardMenuContainerHide',

            //  Dn Filters Events
            'click .ks-options-btn': '_onksOptionsClick',
            'click .print-dashboard-btn': '_onKsDashboardPrint',
            'click .apply-dashboard-date-filter': '_onKsApplyDateFilter',
            'click .clear-dashboard-date-filter': '_onKsClearDateValues',
            'change #ks_start_date_picker': '_ksShowApplyClearDateButton',
            'change #ks_end_date_picker': '_ksShowApplyClearDateButton',
            'click .ks_date_filters_menu': '_ksOnDateFilterMenuSelect',
            'click #ks_item_info': 'ksOnListItemInfoClick',
            'click .ks_chart_color_options': 'ksRenderChartColorOptions',
            'click #ks_chart_canvas_id': 'onChartCanvasClick',
            'click .ks_dashboard_item_chart_info': 'onChartMoreInfoClick',
            'click .ks_chart_xls_csv_export': 'ksChartExportXlsCsv',
            'click .ks_chart_pdf_export': 'ksChartExportPdf',

            'click .ks_dashboard_quick_edit_action_popup': 'ksOnQuickEditView',
        },
        //        Number Formatter into shorthand function
        ksNumFormatter: function (num, digits) {
            var si = [{
                    value: 1,
                    symbol: ""
                },
                {
                    value: 1E3,
                    symbol: "k"
                },
                {
                    value: 1E6,
                    symbol: "M"
                },
                {
                    value: 1E9,
                    symbol: "G"
                },
                {
                    value: 1E12,
                    symbol: "T"
                },
                {
                    value: 1E15,
                    symbol: "P"
                },
                {
                    value: 1E18,
                    symbol: "E"
                }
            ];
            var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            var i;
            for (i = si.length - 1; i > 0; i--) {
                if (num >= si[i].value) {
                    break;
                }
            }
            return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
        },
        //    This is to convert color #value into RGB format to add opacity value.
        _ks_get_rgba_format: function (val) {
            var rgba = val.split(',')[0].match(/[A-Za-z0-9]{2}/g);
            rgba = rgba.map(function (v) {
                return parseInt(v, 16)
            }).join(",");
            return "rgba(" + rgba + "," + val.split(',')[1] + ")";
        },
        init: function(parent, context) {
            this._super(parent, context);
            //// console.log('KsDashboardNinja');
            //// console.log( context.params.ks_dashboard_id );
            this.ks_dashboard_id = context.params.ks_dashboard_id;
            this.ks_dashboard_data = {};
            this.ks_dashboard_data.name = '';
            this.ks_dashboard_data.ks_dashboard_manager = true;
            
            this.action_manager = parent;
            this.controllerID = context.params.controllerID;
            this.ksIsDashboardManager = false;
            this.ksDashboardEditMode = false;
            this.ksNewDashboardName = false;
            this.file_type_magic_word = {
                '/': 'jpg',
                'R': 'gif',
                'i': 'png',
                'P': 'svg+xml',
            };
            this.ksAllowItemClick = true;

            //Dn Filters Iitialization
            var l10n = _t.database.parameters;
            this.form_template = 'ks_dashboard_ninja_template_view';
            this.date_format = time.strftime_to_moment_format(_t.database.parameters.date_format)
            this.date_format = this.date_format.replace(/\bYY\b/g, "YYYY");
            this.datetime_format = time.strftime_to_moment_format((_t.database.parameters.date_format + ' ' + l10n.time_format))
            //            this.is_dateFilter_rendered = false;
            this.ks_date_filter_data;

            // Adding date filter selection options in dictionary format : {'id':{'days':1,'text':"Text to show"}}
            this.ks_date_filter_selections = {
                'l_none': 'Date Filter',
                'l_day': 'Today',
                't_week': 'This Week',
                't_month': 'This Month',
                't_quarter': 'This Quarter',
                't_year': 'This Year',
                'ls_day': 'Last Day',
                'ls_week': 'Last Week',
                'ls_month': 'Last Month',
                'ls_quarter': 'Last Quarter',
                'ls_year': 'Last Year',
                'l_week': 'Last 7 days',
                'l_month': 'Last 30 days',
                'l_quarter': 'Last 90 days',
                'l_year': 'Last 365 days',
                'l_custom': 'Custom Filter',
            };
            // To make sure date filter show date in specific order.
            this.ks_date_filter_selection_order = ['l_day', 't_week','t_month','t_quarter','t_year','ls_day','ls_week','ls_month','ls_quarter','ls_year','l_week','l_month', 'l_quarter','l_year','l_custom'];

            this.ks_dashboard_id = context.params.ks_dashboard_id;

            this.gridstack_options = {
                staticGrid: true,
                float: false
            };
            this.gridstackConfig = {};
            this.grid = false;
            this.chartMeasure = {};
            this.chart_container = {};

            this.ksChartColorOptions = ['default', 'cool', 'warm', 'neon'];
            this.ksUpdateDashboardItem = this.ksUpdateDashboardItem.bind(this);
        },
        willStart: function() {
            var self = this;
            //// console.log('willStart');
            return this._super().then(function() {
                return $.when(
                    self.ks_fetch_data()
                );
            });
        },
        start: function() {
            var self = this;
            return this._super().then(function() {
                self.ksRenderDashboard("start");
                // self.render_dashboards();
                // self.render_graphs();
                // self.$el.parent().addClass('oe_background_grey');
            });
        },
        ks_fetch_data: function() {
            var self = this;
            return ajax.jsonRpc('/dashboard/ks_fetch_dashboard_data', 'call', {
                'dashboard_id': self.ks_dashboard_id, 
            }).done(function(result) {
                // console.log( result );
                self.ks_dashboard_data = result; 
            });
        },

        ksRenderDashboard: function( message = "message" ) {
            // console.log('ksRenderDashboard ' + message);
            var self = this;
            self.$el.empty();
            self.$el.addClass('ks_dashboard_ninja');

            var $ks_header = $(QWeb.render('ksDashboardNinjaHeader', {
                ks_dashboard_name: self.ks_dashboard_data.name,
                ks_dashboard_manager: self.ks_dashboard_data.ks_dashboard_manager,
                date_selection_data: self.ks_date_filter_selections,
                date_selection_order: self.ks_date_filter_selection_order
            }));
            self.$el.append($ks_header);
            
            self.ksRenderDashboardMainContent();
        },
        ksRenderDashboardMainContent: function () {
            var self = this;
            if (self.ks_dashboard_data.ks_item_data) {
                self._renderDateFilterDatePicker();
                self.$el.find('.ks_dashboard_link').removeClass("ks_hide");

                self.$el.find('.print-dashboard-btn').removeClass("ks_hide");

                $('.ks_dashboard_items_list').remove();
                var $dashboard_body_container = $(QWeb.render('ks_main_body_container'))
                var $gridstackContainer = $dashboard_body_container.find(".grid-stack");
                $dashboard_body_container.appendTo(self.$el)
                $gridstackContainer.gridstack(self.gridstack_options);
                self.grid = $gridstackContainer.data('gridstack');
                
                self.ksRenderDashboardItems(Object.values(self.ks_dashboard_data.ks_item_data));

                // In gridstack version 0.3 we have to make static after adding element in dom
                self.grid.setStatic(true);

            }else if (!self.ks_dashboard_data.ks_item_data) {
                self.$el.find('.ks_dashboard_link').addClass("ks_hide");
                self._ksRenderNoItemView();
            }
        },
        _ksRenderNoItemView: function () {
            $('.ks_dashboard_items_list').remove();
            var self = this;
            $(QWeb.render('ksNoItemView')).appendTo(self.$el)
        },
        ksRenderDashboardItems: function (items) {
            var self = this;
            self.$el.find('.print-dashboard-btn').addClass("ks_pro_print_hide");

//            var items = Object.values(self.ks_dashboard_data.ks_item_data);

            if (self.ks_dashboard_data.ks_gridstack_config) {
                self.gridstackConfig = JSON.parse(self.ks_dashboard_data.ks_gridstack_config);
            }
            var item_view;
            var ks_container_class = 'grid-stack-item',
                ks_inner_container_class = 'grid-stack-item-content';
            for (var i = 0; i < items.length; i++) {
                if(self.grid){
                    if (items[i].ks_dashboard_item_type === 'ks_tile') {
                        self._ksRenderDashboardTile(items[i], ks_container_class, ks_inner_container_class)
                    } else if (items[i].ks_dashboard_item_type === 'ks_list_view') {
                        self._renderListView(items[i], self.grid)
                    } else {
                        self._renderGraph(items[i], self.grid)
                    }
                }
            }
        },
        _ksRenderDashboardTile: function (tile, ks_container_class, ks_inner_container_class) {
            // console.log( "_ksRenderDashboardTile" );
            var self = this;
            var ks_icon_url, item_view;
            var ks_rgba_background_color, ks_rgba_font_color, ks_rgba_default_icon_color;
            var style_main_body, style_image_body_l2, style_domain_count_body, style_button_customize_body,
                style_button_delete_body;

            var data_count = self.ksNumFormatter(tile.ks_record_count, 1);
            if (tile.ks_icon_select == "Custom") {
                if (tile.ks_icon[0]) {
                    ks_icon_url = 'data:image/' + (self.file_type_magic_word[tile.ks_icon[0]] || 'png') + ';base64,' + tile.ks_icon;
                } else {
                    ks_icon_url = false;
                }
            }

            tile.ksIsDashboardManager = self.ks_dashboard_data.ks_dashboard_manager;
            ks_rgba_background_color = self._ks_get_rgba_format(tile.ks_background_color);
            ks_rgba_font_color = self._ks_get_rgba_format(tile.ks_font_color);
            ks_rgba_default_icon_color = self._ks_get_rgba_format(tile.ks_default_icon_color);
            style_main_body = "background-color:" + ks_rgba_background_color + ";color : " + ks_rgba_font_color + ";";
            switch (tile.ks_layout) {
                case 'layout1':
                    item_view = QWeb.render('ks_dashboard_item_layout1', {
                        item: tile,
                        style_main_body: style_main_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count
                    });
                    break;

                case 'layout2':
                    var ks_rgba_dark_background_color_l2 = self._ks_get_rgba_format(self.ks_get_dark_color(tile.ks_background_color.split(',')[0], tile.ks_background_color.split(',')[1], -10));
                    style_image_body_l2 = "background-color:" + ks_rgba_dark_background_color_l2 + ";";
                    item_view = QWeb.render('ks_dashboard_item_layout2', {
                        item: tile,
                        style_image_body_l2: style_image_body_l2,
                        style_main_body: style_main_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count

                    });
                    break;

                case 'layout3':
                    item_view = QWeb.render('ks_dashboard_item_layout3', {
                        item: tile,
                        style_main_body: style_main_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count

                    });
                    break;

                case 'layout4':
                    style_main_body = "color : " + ks_rgba_font_color + ";border : solid;border-width : 1px;border-color:" + ks_rgba_background_color + ";"
                    style_image_body_l2 = "background-color:" + ks_rgba_background_color + ";";
                    style_domain_count_body = "color:" + ks_rgba_background_color + ";";
                    item_view = QWeb.render('ks_dashboard_item_layout4', {
                        item: tile,
                        style_main_body: style_main_body,
                        style_image_body_l2: style_image_body_l2,
                        style_domain_count_body: style_domain_count_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count

                    });
                    break;

                case 'layout5':
                    item_view = QWeb.render('ks_dashboard_item_layout5', {
                        item: tile,
                        style_main_body: style_main_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count

                    });
                    break;

                case 'layout6':
                    ks_rgba_default_icon_color = self._ks_get_rgba_format(tile.ks_default_icon_color);
                    item_view = QWeb.render('ks_dashboard_item_layout6', {
                        item: tile,
                        style_image_body_l2: style_image_body_l2,
                        style_main_body: style_main_body,
                        ks_icon_url: ks_icon_url,
                        ks_rgba_default_icon_color: ks_rgba_default_icon_color,
                        ks_container_class: ks_container_class,
                        ks_inner_container_class: ks_inner_container_class,
                        ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                        data_count: data_count

                    });
                    break;

                default:
                    item_view = QWeb.render('ks_dashboard_item_layout_default', {
                        item: tile
                    });
                    break;
            }

            tile.$el = $(item_view);
            // self.grid.addWidget($(item_view), 0, 0, 8, 2, true, 8, null, 2, 2, tile.id);
            if (tile.id in self.gridstackConfig) {
                self.grid.addWidget($(item_view), self.gridstackConfig[tile.id].x, self.gridstackConfig[tile.id].y, self.gridstackConfig[tile.id].width, self.gridstackConfig[tile.id].height, false, 8, null, 2, 2, tile.id);
            } else {
                self.grid.addWidget($(item_view), 0, 0, 8, 2, true, 8, null, 2, 2, tile.id);
            }
        },
        _renderGraph: function (item, grid) {
            var self = this;
            var chart_data = JSON.parse(item.ks_chart_data);
            var chart_id = item.id,
                chart_title = item.name;
            var chart_title = item.name;
            var chart_type = item.ks_dashboard_item_type.split('_')[1];
            switch (chart_type) {
                case "pie":
                case "doughnut":
                case "polarArea":
                    var chart_family = "circle";
                    break;
                case "bar":
                case "horizontalBar":
                case "line":
                case "area":
                    var chart_family = "square"
                    break;
                default:
                    var chart_family = "none";
                    break;

            }

            var $ks_gridstack_container = $(QWeb.render('ks_gridstack_container', {
                ks_chart_title: chart_title,
                ksIsDashboardManager: self.ks_dashboard_data.ks_dashboard_manager,
                ks_dashboard_list: self.ks_dashboard_data.ks_dashboard_list,
                chart_id: chart_id,
                chart_family: chart_family,
                chart_type: chart_type,
                ksChartColorOptions: this.ksChartColorOptions
            })).addClass('ks_dashboarditem_id');
            $ks_gridstack_container.find('.ks_li_' + item.ks_chart_item_color).addClass('ks_date_filter_selected');

//            var groupBy = item.ks_chart_groupby_type==='relational_type'?item.ks_chart_relation_groupby_name:item.ks_chart_date_groupby;
            var $ksChartContainer = $('<canvas id="ks_chart_canvas_id" data-chart-id='+chart_id+'/>');
            $ks_gridstack_container.find('.card-body').append($ksChartContainer);

            item.$el = $ks_gridstack_container;
            if (chart_id in self.gridstackConfig) {
                grid.addWidget($ks_gridstack_container, self.gridstackConfig[chart_id].x, self.gridstackConfig[chart_id].y, self.gridstackConfig[chart_id].width, self.gridstackConfig[chart_id].height, false, 11, null, 3, null, chart_id);
            } else {
                grid.addWidget($ks_gridstack_container, 0, 0, 13, 4, true, 11, null, 3, null, chart_id);
            }

            if(chart_family === "circle"){
                if (chart_data['labels'].length > 30){
                    $ks_gridstack_container.find(".ks_dashboard_color_option").remove();
                    $ks_gridstack_container.find(".card-body").empty().append($("<div style='font-size:20px;'>Too many records for selected Chart Type. Consider using <strong>Domain</strong> to filter records or <strong>Record Limit</strong> to limit the no of records under <strong>30.</strong>"));
                    return ;
                }
            }

            var ksMyChart = new Chart($ksChartContainer[0], {
                type: chart_type === "area" ? "line" : chart_type,
                data: {
                    labels: chart_data['labels'],
                    groupByIds:chart_data['groupByIds'],
                    datasets: chart_data.datasets,
                },
                options: {
                    maintainAspectRatio: false,
                    responsiveAnimationDuration: 1000,
                    animation: {
                        easing: 'easeInQuad',
                    }
                }
            });

            this.chart_container[chart_id] = ksMyChart;
            if(chart_data["datasets"].length>0) self.ksChartColors(item.ks_chart_item_color, ksMyChart, chart_type, chart_family,item.ks_bar_chart_stacked,item.ks_semi_circle_chart);
            ksMyChart.update();

        },
        ksChartColors: function (palette, ksMyChart, ksChartType, ksChartFamily,stack, semi_circle) {
            var currentPalette = "cool";
            if (!palette) palette = currentPalette;
            currentPalette = palette;

            /*Gradients
              The keys are percentage and the values are the color in a rgba format.
              You can have as many "color stops" (%) as you like.
              0% and 100% is not optional.*/
            var gradient;
            switch (palette) {
                case 'cool':
                    gradient = {
                        0: [255, 255, 255, 1],
                        20: [220, 237, 200, 1],
                        45: [66, 179, 213, 1],
                        65: [26, 39, 62, 1],
                        100: [0, 0, 0, 1]
                    };
                    break;
                case 'warm':
                    gradient = {
                        0: [255, 255, 255, 1],
                        20: [254, 235, 101, 1],
                        45: [228, 82, 27, 1],
                        65: [77, 52, 47, 1],
                        100: [0, 0, 0, 1]
                    };
                    break;
                case 'neon':
                    gradient = {
                        0: [255, 255, 255, 1],
                        20: [255, 236, 179, 1],
                        45: [232, 82, 133, 1],
                        65: [106, 27, 154, 1],
                        100: [0, 0, 0, 1]
                    };
                    break;

                case 'default':
                    var color_set = ['#F04F65', '#f69032', '#fdc233', '#53cfce', '#36a2ec', '#8a79fd', '#b1b5be', '#1c425c', '#8c2620', '#71ecef', '#0b4295', '#f2e6ce', '#1379e7']
            }



            //Find datasets and length
            var chartType = ksMyChart.config.type;

            switch (chartType) {
                case "pie":
                case "doughnut":
                case "polarArea":
                    var datasets = ksMyChart.config.data.datasets[0];
                    var setsCount = datasets.data.length;
                    break;
                case "bar":
                case "horizontalBar":
                case "line":
                    var datasets = ksMyChart.config.data.datasets;
                    var setsCount = datasets.length;
                    break;
            }

            //Calculate colors
            var chartColors = [];

            if (palette !== "default") {
                //Get a sorted array of the gradient keys
                var gradientKeys = Object.keys(gradient);
                gradientKeys.sort(function (a, b) {
                    return +a - +b;
                });
                for (var i = 0; i < setsCount; i++) {
                    var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
                    for (var j = 0; j < gradientKeys.length; j++) {
                        var gradientKey = gradientKeys[j];
                        if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
                            chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
                            break;
                        } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
                            var prevKey = gradientKeys[j - 1];
                            var gradientPartIndex = (gradientIndex - prevKey) / (gradientKey - prevKey); //Calculate where
                            var color = [];
                            for (var k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
                                color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
                                if (k < 3) color[k] = Math.round(color[k]);
                            }
                            chartColors[i] = 'rgba(' + color.toString() + ')';
                            break;
                        }
                    }
                }
            } else {
                for (var i = 0, counter = 0; i < setsCount; i++, counter++) {
                    if (counter >= color_set.length) counter = 0; // reset back to the beginning

                    chartColors.push(color_set[counter]);
                }

            }


            var datasets = ksMyChart.config.data.datasets;
            var options = ksMyChart.config.options;

            options.legend.labels.usePointStyle = true;
            if (ksChartFamily == "circle") {
                options.legend.position = 'bottom';
                options.tooltips.callbacks = {
                                              title: function(tooltipItem, data) {
                                                   var k_amount = data.datasets[tooltipItem[0].datasetIndex]['data'][tooltipItem[0].index];
                                                   k_amount = field_utils.round_decimals(k_amount,Float64Array);
                                                   return data.datasets[tooltipItem[0].datasetIndex]['label']+" : " + k_amount;
                                              },
                                              label : function(tooltipItem, data) {
                                                         return data.labels[tooltipItem.index];
                                                       },
                                              }
                for (var i = 0; i < datasets.length; i++) {
                    datasets[i].backgroundColor = chartColors;
                    datasets[i].borderColor = "rgba(255,255,255,1)";
                }
                if(semi_circle && (chartType === "pie" || chartType === "doughnut")){
                    options.rotation = 1*Math.PI;
                    options.circumference = 1*Math.PI;
                }
            } else if (ksChartFamily == "square") {
                options.scales.xAxes[0].gridLines.display = false;
                options.scales.yAxes[0].ticks.beginAtZero = true;
                options.tooltips.callbacks = {
                    label: function(tooltipItem, data) {
                        var k_amount = data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index];
                        k_amount = field_utils.round_decimals(k_amount,Float64Array);
                        return data.datasets[tooltipItem.datasetIndex]['label']+" : " + k_amount;
                    }
                }

                for (var i = 0; i < datasets.length; i++) {
                    switch (ksChartType) {
                        case "bar":
                        case "horizontalBar":
                            if (datasets[i].type && datasets[i].type=="line"){
                                datasets[i].borderColor = chartColors[i];
                                datasets[i].backgroundColor = "rgba(255,255,255,0)";
                            }
                            else{
                                datasets[i].backgroundColor = chartColors[i];
                                datasets[i].borderColor = "rgba(255,255,255,0)";
                                options.scales.xAxes[0].stacked = stack;
                                options.scales.yAxes[0].stacked = stack;
                            }
                            break;
                        case "line":
                            datasets[i].borderColor = chartColors[i];
                            datasets[i].backgroundColor = "rgba(255,255,255,0)";
                            break;
                        case "area":
                            datasets[i].borderColor = chartColors[i];
                            break;

                    }
                }

            }
            ksMyChart.update();
        },
        _checkDateFields: function () {
            if (!($("#ks_start_date_picker").val())) {
                $("#ks_start_date_picker").val($("#ks_end_date_picker").val());
                $("#ksActualStartDateToStore").val($("#ksActualEndDateToStore").val());
            }
            if (!($("#ks_end_date_picker").val())) {
                $("#ks_end_date_picker").val($("#ks_start_date_picker").val());
                $("#ksActualEndDateToStore").val($("#ksActualStartDateToStore").val());
            }
        },
        _KsGetDateValues: function () {
            var self = this;
            var date_format = time.strftime_to_moment_format(_t.database.parameters.date_format);
            var check_format = date_format.search(/YYYY/);
            if (!(check_format !== -1)) {
                date_format = date_format.replace(/YY/g, "YYYY");
            }
            var date_filter_selected = self.ks_dashboard_data.ks_date_filter_selection;
            self.$el.find('#' + date_filter_selected).addClass("ks_date_filter_selected");
            self.$el.find('#ks_date_filter_selection').text(self.ks_date_filter_selections[date_filter_selected]);
            if (self.ks_dashboard_data.ks_dashboard_start_date && self.ks_dashboard_data.ks_dashboard_start_date) {
                self.ks_start_date = self.ks_dashboard_data.ks_dashboard_start_date.split(' ')[0];
                self.$el.find("#ksActualStartDateToStore").val(self.ks_start_date);
                self.ks_end_date = self.ks_dashboard_data.ks_dashboard_end_date.split(' ')[0];
                self.$el.find("#ksActualEndDateToStore").val(self.ks_start_date);
                self.ks_start_date = moment(self.ks_start_date).format(date_format);
                self.ks_end_date = moment(self.ks_end_date).format(date_format);
                self.$el.find("#ks_start_date_picker").val(self.ks_start_date);
                self.$el.find("#ks_end_date_picker").val(self.ks_end_date);
            } else {
                self.ks_start_date = self.ks_end_date = null;
            }
            if (self.ks_dashboard_data.ks_date_filter_selection === 'l_custom' && self.ks_dashboard_data.ks_dashboard_list) {
                self.$el.find('.ks_date_input_fields').removeClass("ks_hide");
                self.$el.find('.ks_date_filter_dropdown').addClass("ks_btn_first_child_radius");
            } else if (self.ks_dashboard_data.ks_date_filter_selection !== 'l_custom' && self.ks_dashboard_data.ks_dashboard_list) {
                self.$el.find('.ks_date_input_fields').addClass("ks_hide");
            }
        },
        _renderDateFilterDatePicker: function () {
            var self = this;

            //Show Print option cause items are present.
            self.$el.find(".ks_dashboard_link").removeClass("ks_hide");

            //Initialization of the date picker with on-select event
            self.$el.find("#ks_start_date_picker").datepicker({
                dateFormat: "yy/mm/dd",
                altFormat: "yy-mm-dd",
                altField: "#ksActualStartDateToStore",
                changeMonth: true,
                changeYear: true,
                language: moment.locale(),
                onSelect: function (ks_start_date) {
                    self.$el.find(".apply-dashboard-date-filter").removeClass("ks_hide");
                    self.$el.find(".clear-dashboard-date-filter").removeClass("ks_hide");
                    self.$el.find("#ks_start_date_picker").val(moment(new Date(ks_start_date)).format(self.date_format));
                    self._checkDateFields();
                },
            });

            self.$el.find("#ks_end_date_picker").datepicker({
                dateFormat: "yy/mm/dd",
                altFormat: "yy-mm-dd",
                altField: "#ksActualEndDateToStore",
                changeMonth: true,
                changeYear: true,
                language: moment.locale(),
                onSelect: function (ks_end_date) {
                    self.$el.find(".apply-dashboard-date-filter").removeClass("ks_hide");
                    self.$el.find(".clear-dashboard-date-filter").removeClass("ks_hide");
                    self.$el.find("#ks_end_date_picker").val(moment(new Date(ks_end_date)).format(self.date_format));
                    self._checkDateFields();
                },
            });
            self._KsGetDateValues();
            $('#ui-datepicker-div').addClass('ks_dashboard_datepicker_z-index');
        },
        // Note : this is exceptionally bind to this function.
        ksUpdateDashboardItem : function (ids) {
            var self = this;
            for (var i=0;i<ids.length;i++){
                var item_data = self.ks_dashboard_data.ks_item_data[ids[i]];
                self.grid.removeWidget(self.$el.find(".grid-stack-item[data-gs-id="+item_data.id+"]"));
                self.ksRenderDashboardItems([item_data]);
            }
            self.grid.setStatic(true);
        },
        _onKsEditLayoutClick: function () {
            var self = this;
            //// console.log( "_onKsEditLayoutClick" );

            self._ksRenderEditMode();

        },
        _ksRenderEditMode: function () {
            var self = this;

            self.ks_remove_update_interval();

            $('#ks_dashboard_title_input').val(self.ks_dashboard_data.name);

            $('.ks_am_element').addClass("ks_hide");
            $('.ks_em_element').removeClass("ks_hide");

            self.$el.find('.ks_item_click').addClass('ks_item_not_click').removeClass('ks_item_click');
            self.$el.find('.ks_dashboard_item').removeClass('ks_dashboard_item_header_hover');
            self.$el.find('.ks_dashboard_item_header').removeClass('ks_dashboard_item_header_hover');

            self.$el.find('.ks_dashboard_item_l2').removeClass('ks_dashboard_item_header_hover');
            self.$el.find('.ks_dashboard_item_header_l2').removeClass('ks_dashboard_item_header_hover');

            self.$el.find('.ks_dashboard_item_l5').removeClass('ks_dashboard_item_header_hover');

            self.$el.find('.ks_dashboard_item_button_container').removeClass('ks_dashboard_item_header_hover');

            self.$el.find('.ks_dashboard_link').addClass("ks_hide")
            self.$el.find('.ks_dashboard_top_settings').addClass("ks_hide")
            self.$el.find('.ks_dashboard_edit_mode_settings').removeClass("ks_hide")

            // Adding Chart grab able cals
            self.$el.find('.ks_chart_container').addClass('ks_item_not_click');
            self.$el.find('.ks_list_view_container').addClass('ks_item_not_click');

            if (self.grid) {
                self.grid.enable();
                // console.log( "grid.enable" );

            }
        },
        _ksRenderActiveMode: function () {
            var self = this

            if (self.grid) {
                $('.grid-stack').data('gridstack').disable();
            }

            $('#ks_dashboard_title_label').text(self.ks_dashboard_data.name);

            $('.ks_am_element').removeClass("ks_hide");
            $('.ks_em_element').addClass("ks_hide");
            if (self.ks_dashboard_data.ks_item_data) $('.ks_am_content_element').removeClass("ks_hide");

            self.$el.find('.ks_item_not_click').addClass('ks_item_click').removeClass('ks_item_not_click')
            self.$el.find('.ks_dashboard_item').addClass('ks_dashboard_item_header_hover')
            self.$el.find('.ks_dashboard_item_header').addClass('ks_dashboard_item_header_hover')

            self.$el.find('.ks_dashboard_item_l2').addClass('ks_dashboard_item_header_hover')
            self.$el.find('.ks_dashboard_item_header_l2').addClass('ks_dashboard_item_header_hover')

            //      For layout 5
            self.$el.find('.ks_dashboard_item_l5').addClass('ks_dashboard_item_header_hover')

            self.$el.find('.ks_dashboard_item_button_container').addClass('ks_dashboard_item_header_hover');

            self.$el.find('.ks_dashboard_top_settings').removeClass("ks_hide")
            self.$el.find('.ks_dashboard_edit_mode_settings').addClass("ks_hide")

            self.$el.find('.ks_chart_container').removeClass('ks_item_not_click ks_item_click');

            self.ks_set_update_interval();
        },
        _ksToggleEditMode: function () {
            var self = this
            if (self.ksDashboardEditMode) {
                self._ksRenderActiveMode()
                self.ksDashboardEditMode = false
            } else if (!self.ksDashboardEditMode) {
                self._ksRenderEditMode()
                self.ksDashboardEditMode = true
            }
        },
        _onKsSaveLayoutClick: function () {
            var self = this;
            //// console.log('_onKsSaveLayoutClick');
            //        Have  to save dashboard here
            var dashboard_title = $('#ks_dashboard_title_input').val( );
            if (dashboard_title != false && dashboard_title != 0 && dashboard_title !== self.ks_dashboard_data.name) {
                //// console.log('_onKsSaveLayoutClick TRUE');
                self.ks_dashboard_data.name = dashboard_title;
                ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                    'dashboard_id': self.ks_dashboard_id, 
                    'values': {
                        'name': dashboard_title
                    }, 
                });
            }
            if(this.ks_dashboard_data.ks_item_data) self._ksSaveCurrentLayout();
            self._ksRenderActiveMode();
        },
        _ksSaveCurrentLayout: function () {
            var self = this;
            var items = $('.grid-stack').data('gridstack').grid.nodes;
            var grid_config = {}
            for (var i = 0; i < items.length; i++) {
                grid_config[items[i].id] = {
                    'x': items[i].x,
                    'y': items[i].y,
                    'width': items[i].width,
                    'height': items[i].height
                }
            }
            ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                'dashboard_id': self.ks_dashboard_id, 
                'values': {
                    "ks_gridstack_config": JSON.stringify(grid_config)
                }, 
            });
            // this._rpc({
            //     model: 'ks_dashboard_ninja.board',
            //     method: 'write',
            //     args: [self.ks_dashboard_id, {
            //         "ks_gridstack_config": JSON.stringify(grid_config)
            //     }],
            // });
        },
        _onKsCancelLayoutClick: function () {
            var self = this;
            //        render page again
            $.when(self.ks_fetch_data()).then(function () {
                self.ksRenderDashboard();
                self.ks_set_update_interval();
            });
        },
        onAddItemTypeClick : function(e){
            var self = this;

            self.do_action({
                type: 'ir.actions.act_window',
                res_model: 'ks_dashboard_ninja.item',
                view_id: 'ks_dashboard_ninja_list_form_view',
                views: [
                    [false, 'form']
                ],
                target: 'current',
                context: {
                    'ks_dashboard_id': self.ks_dashboard_id,
                    'ks_dashboard_item_type':e.currentTarget.dataset.item,
                    'form_view_ref':'ks_dashboard_ninja.item_form_view',
                },
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb,
            });

        },
        _onKsAddLayoutClick: function () {
            var self = this;

            self.do_action({
                type: 'ir.actions.act_window',
                res_model: 'ks_dashboard_ninja.item',
                view_id: 'ks_dashboard_ninja_list_form_view',
                views: [
                    [false, 'form']
                ],
                target: 'current',
                context: {
                    'ks_dashboard_id': self.ks_dashboard_id,
                    'form_view_ref':'ks_dashboard_ninja.item_form_view',
                },
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb,
            });
        },
        //TODO: Remove this or Use this
        onKsSelectItemClick: function () {},

        _onKsCancelLayoutClick: function () {
            var self = this;
            //        render page again
            $.when(self.ks_fetch_data()).then(function () {
                self.ksRenderDashboard();
                self.ks_set_update_interval();
            });
        },
        _onKsItemClick: function (e) {
            var self = this;
            //            To Handle only allow item to open when not clicking on item
            if (self.ksAllowItemClick) {
                e.preventDefault();
                //                var self = this;
                if (e.target.title != "Customize Item") {
                    var item_id = parseInt(e.currentTarget.firstElementChild.id);
                    var item_data = self.ks_dashboard_data.ks_item_data[item_id];

                    self.do_action({
                        name: _t('Selected records'),
                        type: 'ir.actions.act_window',
                        res_model: item_data.ks_model_name,
                        domain: item_data.ks_domain || "[]",
                        views: [
                            [false, 'list'],
                            [false, 'form']
                        ],
                        view_mode: 'list',
                        target: 'current',
                    }, {
                        on_reverse_breadcrumb: self.on_reverse_breadcrumb,
                    });
                }
            } else {
                self.ksAllowItemClick = true;
            }
        },
        _onKsItemCustomizeClick: function (e) {
            var self = this;
            var id = parseInt($($(e.currentTarget).parentsUntil('.grid-stack').slice(-1)[0]).attr('data-gs-id'))
            self.ks_open_item_form_page(id);

            e.stopPropagation();
        },
        ks_open_item_form_page: function (id) {
            var self = this;
            self.do_action({
                type: 'ir.actions.act_window',
                res_model: 'ks_dashboard_ninja.item',
                view_id: 'ks_dashboard_ninja_list_form_view',
                views: [
                    [false, 'form']
                ],
                target: 'current',
                context: {
                    'form_view_ref':'ks_dashboard_ninja.item_form_view',
                },
                res_id: id
            }, {
                on_reverse_breadcrumb: this.on_reverse_breadcrumb,
            });
        },
        _onKsDeleteItemClick: function (e) {
            var self = this;
            var id = parseInt($($(e.currentTarget).parentsUntil('.grid-stack').slice(-1)[0]).attr('data-gs-id'))
            self.ks_delete_item(id);
            e.stopPropagation();
        },
        ks_delete_item: function (ks_item_id) {
            var self = this;
            Dialog.confirm(this, (_t("Are you sure you want to remove this item?")), {
                confirm_callback: function () {
                    ajax.jsonRpc('/dashboard/ks_dashboard_ninja_item_unlink', 'call', {
                        'ks_item_id': ks_item_id, 
                    }).then(function (data) {
                        $.when(self.ks_fetch_data()).then(function () {
                            self.ksRenderDashboardMainContent();
                            if(self.ks_dashboard_data.ks_item_data) self._ksSaveCurrentLayout();
                        });
                    });
                },
            });

        },
        _onKsInputChange: function (e) {
            this.ksNewDashboardName = e.target.value
        },
        onKsDuplicateItemClick: function (e) {
            var self = this;
            var ks_item_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).parent().attr('id');
            var dashboard_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select').val();
            var dashboard_name = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select option:selected').text();
            ajax.jsonRpc('/dashboard/ks_dashboard_ninja_item_copy', 'call', {
                'ks_item_id': ks_item_id, 
                'values': {
                    'ks_dashboard_ninja_board_id': dashboard_id
                }, 
            }).then(function (result) {
                self.do_notify(
                        _t("Item Duplicated"),
                        _t('Selected item is duplicated to '+dashboard_name+' .')
                    );
                $.when(self.ks_fetch_data()).then(function () {
                    self.ksRenderDashboard();
                });
            })
        },
        onKsMoveItemClick: function (e) {
            var self = this;
            var ks_item_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).parent().attr('id');
            var dashboard_id = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select').val();
            var dashboard_name = $($(e.target).parentsUntil(".ks_dashboarditem_id").slice(-1)[0]).find('.ks_dashboard_select option:selected').text();
            this._rpc({
                model: 'ks_dashboard_ninja.item',
                method: 'write',
                args: [parseInt(ks_item_id), {
                    'ks_dashboard_ninja_board_id': parseInt(dashboard_id)
                }],
            }).then(function (result) {
                self.do_notify(
                    _t("Item Moved"),
                    _t('Selected item is moved to '+dashboard_name+' .')
                );
                $.when(self.ks_fetch_data()).then(function () {
                    self.ksRenderDashboard();
                });
            })

        },
        ksStopClickPropagation: function (e) {
            this.ksAllowItemClick = false;
        },
        onKsDashboardMenuContainerShow: function (e) {
            $(e.currentTarget).addClass('ks_dashboard_item_menu_show');
            this.ks_remove_update_interval();
             //            Dynamic Bootstrap menu populate Image Report
            if($(e.target).hasClass('ks_dashboard_more_action')){
                var chart_id = e.target.dataset.itemId;
                var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
                var base64_image = this.chart_container[chart_id].toBase64Image();
                $(e.target).find('.dropdown-menu').empty();
                $(e.target).find('.dropdown-menu').append($(QWeb.render('ksMoreChartOptions', {
                href: base64_image, download_fileName:name,chart_id:chart_id })))
            }
        },
        onKsDashboardMenuContainerHide: function (e) {
            $(e.currentTarget).removeClass('ks_dashboard_item_menu_show');
            this.ks_set_update_interval();
        },
        //Click event for dashboard print button. Will print pdf of current dashboard.
        _onKsDashboardPrint: function (e) {
            var self = this;
            framework.blockUI();
            this.ksPrepareViewBeforePrint();
            var current_date = $.datepicker.formatDate('yy/mm/dd', new Date());
            var report_name = this.ks_dashboard_data.name + "_" + current_date
            html2canvas($(this.$el.context), {
                profile: true,
                useCORS: true,
                allowTaint: true
            }).then(function (canvas) {
                var ks_img = canvas.toDataURL('image/png');
                var doc = new jsPDF('p', 'mm');
                doc.addImage(ks_img, 'PNG', 5, 10, 200, 0);
                doc.save(report_name);
                framework.unblockUI();
                $.when(self.ks_fetch_data()).then(function () {
                    self.ksRenderDashboard();
                });
            });
        },
        _onKsApplyDateFilter: function (e) {
            // console.log( "_onKsApplyDateFilter" );
            var self = this;
            var date_format = time.strftime_to_moment_format(_t.database.parameters.date_format);
            var check_format = date_format.search(/YYYY/);
            if (!(check_format !== -1)) {
                date_format = date_format.replace(/YY/g, "YYYY");
            }
            var start_date = self.$el.find("#ksActualStartDateToStore").val();
            var end_date = self.$el.find("#ksActualEndDateToStore").val();
            if (start_date === "Invalid date") {
                alert("Invalid Date is given in Start Date.")
            } else if (end_date === "Invalid date") {
                alert("Invalid Date is given in End Date.")
            } else if (self.$el.find('.ks_date_filter_selected').attr('id') !== "l_custom") {
                // console.log( self.$el.find('.ks_date_filter_selected').attr('id') );
                // this._rpc({
                //     model: 'ks_dashboard_ninja.board',
                //     method: 'write',
                //     args: [self.ks_dashboard_id, {
                //         "ks_date_filter_selection": self.$el.find('.ks_date_filter_selected').attr('id'),
                //     }],
                // })
                ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                    'dashboard_id': self.ks_dashboard_id, 
                    'values': {
                        "ks_date_filter_selection": self.$el.find('.ks_date_filter_selected').attr('id'),
                    }, 
                }).then(function (data) {
                    console.log( data );
                    $.when(self.ks_fetch_data()).then(function () {
                        self.ksRenderDashboard();
                    });
                });
            } else {
                start_date = start_date + " 00:00:00";
                end_date = end_date + " 23:59:59";
                if (start_date && end_date) {
                    if (start_date < end_date) {
                        // this._rpc({
                        //     model: 'ks_dashboard_ninja.board',
                        //     method: 'write',
                        //     args: [self.ks_dashboard_id, {
                        //         "ks_dashboard_start_date": start_date,
                        //         "ks_dashboard_end_date": end_date,
                        //         "ks_date_filter_selection": self.$el.find('.ks_date_filter_selected').attr('id')
                        //     }],
                        // })
                        ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                            'dashboard_id': self.ks_dashboard_id, 
                            'values': {
                                "ks_dashboard_start_date": start_date,
                                "ks_dashboard_end_date": end_date,
                                "ks_date_filter_selection": self.$el.find('.ks_date_filter_selected').attr('id')
                            }, 
                        }).then(function (data) {
                            $.when(self.ks_fetch_data()).then(function () {
                                self.ksRenderDashboard();
                            });
                        });
                    } else {
                        alert(_t("Start date should be less than end date"));
                    }
                } else {
                    alert(_t("Please enter start date and end date"));
                }
            }
        },
        _onKsClearDateValues: function () {
            var self = this;
            // this._rpc({
            //     model: 'ks_dashboard_ninja.board',
            //     method: 'write',
            //     args: [self.ks_dashboard_id, {
            //         "ks_dashboard_start_date": false,
            //         "ks_dashboard_end_date": false,
            //         "ks_date_filter_selection": 'l_none',
            //     }],
            // })
            ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                'dashboard_id': self.ks_dashboard_id, 
                'values': {
                    "ks_dashboard_start_date": false,
                    "ks_dashboard_end_date": false,
                    "ks_date_filter_selection": 'l_none',
                }, 
            }).then(function (data) {
                $.when(self.ks_fetch_data()).then(function () {
                    self.ksRenderDashboard();
                });
            });
        },
        _ksShowApplyClearDateButton: function () {
            if ($("#ks_start_date_picker").val() && $("#ks_end_date_picker").val()) {
                $(".apply-dashboard-date-filter").removeClass("ks_hide");
                $(".clear-dashboard-date-filter").removeClass("ks_hide");
            } else {
                $(".apply-dashboard-date-filter").addClass("ks_hide");
                $(".clear-dashboard-date-filter").addClass("ks_hide");
            }
        },
        _ksOnDateFilterMenuSelect: function (e) {
            if (e.target.id !== 'ks_date_selector_container') {
                var self = this;
                _.each($('.ks_date_filter_selected'), function ($filter_options) {
                    $($filter_options).removeClass("ks_date_filter_selected")
                });
                $(e.target.parentElement).addClass("ks_date_filter_selected");
                $('#ks_date_filter_selection').text(self.ks_date_filter_selections[e.target.parentElement.id]);

                if (e.target.parentElement.id !== "l_custom") {
                    $('.ks_date_input_fields').addClass("ks_hide");
                    $('.ks_date_filter_dropdown').removeClass("ks_btn_first_child_radius");
                    e.target.parentElement.id === "l_none" ? self._onKsClearDateValues() : self._onKsApplyDateFilter();
                } else if (e.target.parentElement.id === "l_custom") {
                    $("#ks_start_date_picker").val(null).removeClass("ks_hide");
                    $("#ks_end_date_picker").val(null).removeClass("ks_hide");
                    $('.ks_date_input_fields').removeClass("ks_hide");
                    $('.ks_date_filter_dropdown').addClass("ks_btn_first_child_radius");
                }
            }
        },
        ksOnListItemInfoClick: function (e) {
            var self = this;
            var item_id = e.currentTarget.dataset.itemId;
            var item_data = self.ks_dashboard_data.ks_item_data[item_id];
            var action = {
                    name: _t(item_data.name),
                    type: 'ir.actions.act_window',
                    res_model: e.currentTarget.dataset.model,
                    domain: item_data.ks_domain || [],
                    views: [
                        [false, 'list'],
                        [false, 'form']
                    ],
                    target: 'current',
                }
            if(e.currentTarget.dataset.listType==="none"){
                action['view_mode'] = 'form';
                action['views'] = [[false, 'form']];
                action['res_id'] = parseInt(e.currentTarget.dataset.recordId);
            }else if(e.currentTarget.dataset.listType==="date_type"){
                action['view_mode'] = 'list';
                action['context'] = {
                                        'group_by':e.currentTarget.dataset.groupby,
                                    };
            }else if(e.currentTarget.dataset.listType==="relational_type"){
                action['view_mode'] = 'list';
                action['context'] = {
                                        'group_by':e.currentTarget.dataset.groupby,
                                    };
                action['context']['search_default_'+e.currentTarget.dataset.groupby] = parseInt(e.currentTarget.dataset.recordId);
            }
            self.do_action(action,{
                    on_reverse_breadcrumb: this.on_reverse_breadcrumb,
                });
        },
        ksRenderChartColorOptions: function (e) {
            var self = this;
            if (!$(e.currentTarget).parent().hasClass('ks_date_filter_selected')) {
                //            FIXME : Correct this later.
                var $parent = $(e.currentTarget).parent().parent();
                $parent.find('.ks_date_filter_selected').removeClass('ks_date_filter_selected')
                $(e.currentTarget).parent().addClass('ks_date_filter_selected')
                var item_data = self.ks_dashboard_data.ks_item_data[$parent.data().itemId];
                this.ksChartColors(e.currentTarget.dataset.chartColor, this.chart_container[$parent.data().itemId], $parent.data().chartType, $parent.data().chartFamily,item_data.ks_bar_chart_stacked,item_data.ks_semi_circle_chart)
                this._rpc({
                    model: 'ks_dashboard_ninja.item',
                    method: 'write',
                    args: [$parent.data().itemId, {
                        "ks_chart_item_color": e.currentTarget.dataset.chartColor
                    }],
                });

            }
        },
        onChartCanvasClick : function(evt){
            var self = this;
            var item_id = evt.currentTarget.dataset.chartId;
            var myChart = self.chart_container[item_id];
            var activePoint = myChart.getElementAtEvent(evt)[0];
            if (activePoint){
                var item_data = self.ks_dashboard_data.ks_item_data[item_id];

                var groupBy = item_data.ks_chart_groupby_type==='relational_type'?item_data.ks_chart_relation_groupby_name:item_data.ks_chart_relation_groupby_name+':'+item_data.ks_chart_date_groupby;
                var domain = item_data.ks_domain;
                var action = {
                    name: _t(item_data.name),
                    type: 'ir.actions.act_window',
                    res_model: item_data.ks_model_name,
                    domain: domain || [],
                    context: {
                        'group_by':groupBy,
                    },
                    views: [
                        [false, 'list'],
                        [false, 'form']
                    ],
                    view_mode: 'list',
                    target: 'current',
                }
                if(activePoint._chart.data.groupByIds){
                    action['context']['search_default_'+groupBy] = activePoint._chart.data.groupByIds[activePoint._index];
                }
                self.do_action(action, {
                                    on_reverse_breadcrumb: self.on_reverse_breadcrumb,
                                });

            }
        },
        onChartMoreInfoClick : function(evt){
            var self = this;
            var item_id = evt.currentTarget.dataset.itemId;
            var item_data = self.ks_dashboard_data.ks_item_data[item_id];
            var groupBy = item_data.ks_chart_groupby_type==='relational_type'?item_data.ks_chart_relation_groupby_name:item_data.ks_chart_relation_groupby_name+':'+item_data.ks_chart_date_groupby;
            var domain = item_data.ks_domain;
            var action = {
                    name: _t(item_data.name),
                    type: 'ir.actions.act_window',
                    res_model: item_data.ks_model_name,
                    domain: domain || [],
                    context: {
                        'group_by':groupBy,
                    },
                    views: [
                        [false, 'list'],
                        [false, 'form']
                    ],
                    view_mode: 'list',
                    target: 'current',
                }
            self.do_action(action, {
                                on_reverse_breadcrumb: self.on_reverse_breadcrumb,
                            });

        },

        ksChartExportXlsCsv : function(e){
            var chart_id = e.currentTarget.dataset.chartId;
            var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
            var data = {
                         "header":name,
                         "chart_data":this.ks_dashboard_data.ks_item_data[chart_id].ks_chart_data,
                       }
                 framework.blockUI();
                 this.getSession().get_file({
                     url: '/ks_dashboard_ninja/export/'+e.currentTarget.dataset.format,
                     data: {data:JSON.stringify(data)},
                     complete: framework.unblockUI,
                     error: crash_manager.rpc_error.bind(crash_manager),
                 });
        },
         ksChartExportPdf : function(e){
            var chart_id = e.currentTarget.dataset.chartId;
            var name = this.ks_dashboard_data.ks_item_data[chart_id].name;
            var base64_image = this.chart_container[chart_id].toBase64Image()
            var doc = new jsPDF('p', 'mm');
            doc.addImage(base64_image, 'PNG', 5, 10, 200, 0);
            doc.save(name);
        },
        ksOnQuickEditView : function(e){
            var self = this;
            var item_id = e.currentTarget.dataset.itemId;
            var item_data = this.ks_dashboard_data.ks_item_data[item_id];
            var item_el = $.find(`[data-gs-id=${item_id}]`);
            var $quickEditButton = $(QWeb.render('ksQuickEditButtonContainer',{
                grid : $.extend({},item_el[0].dataset)
            }));
            $(item_el).before($quickEditButton);

            var ksQuickEditViewWidget = new KsQuickEditView.QuickEditView(this,{
                item : item_data,
            });

            ksQuickEditViewWidget.appendTo($quickEditButton.find('.dropdown-menu'));

            ksQuickEditViewWidget.on("canBeDestroyed",this,function(result){
                if(ksQuickEditViewWidget){
                    ksQuickEditViewWidget = false;
                    $quickEditButton.find('.ks_dashboard_item_action').click();
                }
            });

            ksQuickEditViewWidget.on("canBeRendered",this,function(result){
               $quickEditButton.find('.ks_dashboard_item_action').click();
            });

            ksQuickEditViewWidget.on("openFullItemForm",this,function(result){
               ksQuickEditViewWidget.destroy();
               $quickEditButton.find('.ks_dashboard_item_action').click();
               self.ks_open_item_form_page(parseInt(item_id));
            });


            $quickEditButton.on("hide.bs.dropdown",function(){
                if (ksQuickEditViewWidget){
                    ksQuickEditViewWidget.ksDiscardChanges();
                    ksQuickEditViewWidget = false;
                    self.ks_set_update_interval();
                    $quickEditButton.remove();
                }else{
                    self.ks_set_update_interval();
                    $quickEditButton.remove();
                }
            });

            $quickEditButton.on("show.bs.dropdown",function(){
                self.ks_remove_update_interval();
            });

            e.stopPropagation();
        },

    });

    core.action_registry.add('ks_dashboard_ninja', KsDashboardNinja);

    return KsDashboardNinja;
});
