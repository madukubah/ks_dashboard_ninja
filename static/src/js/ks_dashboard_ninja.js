odoo.define('ks_dashboard_ninja.ks_dashboard', function (require) {
    "use strict";

    var core = require('web.core');
    var Dialog = require('web.Dialog');
    // var viewRegistry = require('web.view_registry');

    var _t = core._t;
    var QWeb = core.qweb;

    // var framework = require('web.framework');
    // var time = require('web.time');

    // var AbstractAction = require('web.AbstractAction');
    var Widget = require('web.Widget');

    var ajax = require('web.ajax');
    var ControlPanelMixin = require('web.ControlPanelMixin');
    // var framework = require('web.framework');
    // var crash_manager = require('web.crash_manager');
    // var field_utils = require('web.field_utils');

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

        events: {
            'click #ks_add_item_selection > li': 'onAddItemTypeClick',
            'click .ks_dashboard_edit_layout': '_onKsEditLayoutClick',
            'click .ks_dashboard_cancel_layout': '_onKsCancelLayoutClick',
            'click .ks_dashboard_save_layout': '_onKsSaveLayoutClick',
        },
        init: function(parent, context) {
            this._super(parent, context);
            console.log('KsDashboardNinja');
            console.log( context.params.ks_dashboard_id );
            this.ks_dashboard_id = context.params.ks_dashboard_id;
            this.ks_dashboard_data = {};
            this.ks_dashboard_data.name = '';
            this.ks_dashboard_data.ks_dashboard_manager = true;
            
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
        },
        willStart: function() {
            var self = this;
            console.log('willStart');
            return this._super().then(function() {
                return $.when(
                    self.ks_fetch_data()
                );
            });
        },
        start: function() {
            var self = this;
            return this._super().then(function() {
                self.ksRenderDashboard();
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
                console.log('ks_fetch_dashboard_data');
                console.log( result );
                self.ks_dashboard_data = result; 
            });
        },

        ksRenderDashboard: function() {
            console.log('ksRenderDashboard');
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
        _onKsEditLayoutClick: function () {
            var self = this;
            console.log( "_onKsEditLayoutClick" );

            self._ksRenderEditMode();

        },
        _ksRenderEditMode: function () {
            var self = this;

            $('#ks_dashboard_title_input').val(self.ks_dashboard_data.name);

            $('.ks_am_element').addClass("ks_hide");
            $('.ks_em_element').removeClass("ks_hide");

            self.$el.find('.ks_dashboard_link').addClass("ks_hide")
            self.$el.find('.ks_dashboard_top_settings').addClass("ks_hide")
            self.$el.find('.ks_dashboard_edit_mode_settings').removeClass("ks_hide")

        },
        _ksRenderActiveMode: function () {
            console.log('_ksRenderActiveMode');
            var self = this
            
            $('#ks_dashboard_title_label').text(self.ks_dashboard_data.name);

            $('.ks_am_element').removeClass("ks_hide");
            $('.ks_em_element').addClass("ks_hide");

            self.$el.find('.ks_dashboard_top_settings').removeClass("ks_hide")
            self.$el.find('.ks_dashboard_edit_mode_settings').addClass("ks_hide")

        },
        _onKsSaveLayoutClick: function () {
            var self = this;
            console.log('_onKsSaveLayoutClick');
            //        Have  to save dashboard here
            var dashboard_title = $('#ks_dashboard_title_input').val( );
            if (dashboard_title != false && dashboard_title != 0 && dashboard_title !== self.ks_dashboard_data.name) {
                console.log('_onKsSaveLayoutClick TRUE');
                self.ks_dashboard_data.name = dashboard_title;
                ajax.jsonRpc('/dashboard/ks_dashboard_ninja_write', 'call', {
                    'dashboard_id': self.ks_dashboard_id, 
                    'values': {
                        'name': dashboard_title
                    }, 
                });
            }
            // if(this.ks_dashboard_data.ks_item_data) self._ksSaveCurrentLayout();
            self._ksRenderActiveMode();
        },
        _onKsCancelLayoutClick: function () {
            var self = this;
            //        render page again
            $.when(self.ks_fetch_data()).then(function () {
                self.ksRenderDashboard();
                // self.ks_set_update_interval();
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

    });

    core.action_registry.add('ks_dashboard_ninja', KsDashboardNinja);

    return KsDashboardNinja;
});
