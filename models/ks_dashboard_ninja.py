 # -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from ..lib.ks_date_filter_selections import ks_get_date


class KsDashboardNinjaBoard(models.Model):
    _name = 'ks_dashboard_ninja.board'

    name = fields.Char(string="Dashboard Name", required=True, size=35)
    ks_dashboard_items_ids = fields.One2many('ks_dashboard_ninja.item', 'ks_dashboard_ninja_board_id',
                                             string='Dashboard Items')
    ks_dashboard_menu_name = fields.Char(string="Menu Name")
    ks_dashboard_top_menu_id = fields.Many2one('ir.ui.menu', domain="[('parent_id','=',False)]",
                                               string="Show Under Menu")
    ks_dashboard_client_action_id = fields.Many2one('ir.actions.client')
    ks_dashboard_menu_id = fields.Many2one('ir.ui.menu')
    ks_dashboard_state = fields.Char()
    ks_dashboard_active = fields.Boolean(string="Active", default=True)
    ks_dashboard_group_access = fields.Many2many('res.groups', string="Group Access")

    # DateFilter Fields
    ks_dashboard_start_date = fields.Datetime()
    ks_dashboard_end_date = fields.Datetime()
    ks_date_filter_selection = fields.Selection([
        ('l_none', 'None'),
        ('l_day', 'Today'),
        ('t_week', 'This Week'),
        ('t_month', 'This Month'),
        ('t_quarter', 'This Quarter'),
        ('t_year', 'This Year'),
        ('ls_day', 'Last Day'),
        ('ls_week', 'Last Week'),
        ('ls_month', 'Last Month'),
        ('ls_quarter', 'Last Quarter'),
        ('ls_year', 'Last Year'),
        ('l_week', 'Last 7 days'),
        ('l_month', 'Last 30 days'),
        ('l_quarter', 'Last 90 days'),
        ('l_year', 'Last 365 days'),
        ('l_custom', 'Custom Filter'),
    ], default='l_none')

    ks_gridstack_config = fields.Char('Item Configurations')
    ks_dashboard_default_template = fields.Many2one('ks_dashboard_ninja.board_template',
                                                    default=lambda self: self.env.ref('ks_dashboard_ninja.ks_blank',
                                                                                      False),
                                                    string="Dashboard Template", required=True)

    ks_set_interval = fields.Selection([
        (15000, '15 Seconds'),
        (30000, '30 Seconds'),
        (45000, '45 Seconds'),
        (60000, '1 minute'),
        (120000, '2 minute'),
        (300000, '5 minute'),
        (600000, '10 minute'),
    ], string="Update Interval")

    @api.model
    def ks_fetch_item(self, item_list):
        """
        :rtype: object
        :param item_list: list of item ids.
        :return: {'id':[item_data]}
        """
        items = {}
        item_model = self.env['ks_dashboard_ninja.item']
        for item_id in item_list:
            item = self.ks_fetch_item_data(item_model.browse(item_id))
            items[item['id']] = item
        return items
    
    # fetching Item info (Divided to make function inherit easily)
    def ks_fetch_item_data(self, rec):
        """
        :rtype: object
        :param item_id: item object
        :return: object with formatted item data
        """
        item = {
            'name': rec.name if rec.name else rec.ks_model_id.name if rec.ks_model_id else "Name",
            'ks_background_color': rec.ks_background_color,
            'ks_font_color': rec.ks_font_color,
            'ks_domain': rec.ks_domain.replace('"%UID"', str(self.env.user.id)) if rec.ks_domain and "%UID" in rec.ks_domain else rec.ks_domain,
            'ks_icon': rec.ks_icon,
            'ks_model_id': rec.ks_model_id.id,
            'ks_model_name': rec.ks_model_name,
            'ks_model_display_name': rec.ks_model_id.name,
            'ks_record_count_type': rec.ks_record_count_type,
            'ks_record_count': rec.ks_record_count,
            'id': rec.id,
            'ks_layout': rec.ks_layout,
            'ks_icon_select': rec.ks_icon_select,
            'ks_default_icon': rec.ks_default_icon,
            'ks_default_icon_color': rec.ks_default_icon_color,
            #Pro Fields
            'ks_dashboard_item_type': rec.ks_dashboard_item_type,

            'ks_date_filter_selection': rec.ks_date_filter_selection,

            'ks_chart_item_color': rec.ks_chart_item_color,
            'ks_chart_groupby_type': rec.ks_chart_groupby_type,
            'ks_chart_relation_groupby': rec.ks_chart_relation_groupby.id,
            'ks_chart_relation_groupby_name': rec.ks_chart_relation_groupby.name,
            'ks_chart_date_groupby': rec.ks_chart_date_groupby,
            'ks_record_field': rec.ks_record_field.id if rec.ks_record_field else False,
            'ks_chart_data': rec.ks_chart_data,
            'ks_list_view_data': rec.ks_list_view_data,
            'ks_chart_data_count_type': rec.ks_chart_data_count_type,
            'ks_bar_chart_stacked': rec.ks_bar_chart_stacked,
            'ks_semi_circle_chart': rec.ks_semi_circle_chart,
            'ks_list_view_type': rec.ks_list_view_type,
            'ks_list_view_group_fields': rec.ks_list_view_group_fields.ids if rec.ks_list_view_group_fields else False,
        }
        return item

    def ks_set_date(self, ks_dashboard_id):
        ks_date_filter_selection = self.browse(ks_dashboard_id).ks_date_filter_selection

        if ks_date_filter_selection not in ['l_custom', 'l_none']:
            ks_date_data = ks_get_date(ks_date_filter_selection)

            self.browse(ks_dashboard_id).write({'ks_dashboard_end_date': ks_date_data["selected_end_date"],
                                                'ks_dashboard_start_date': ks_date_data["selected_start_date"]})

class KsDashboardNinjaTemplate(models.Model):
    _name = 'ks_dashboard_ninja.board_template'

    name = fields.Char()
    ks_gridstack_config = fields.Char()
    ks_item_count = fields.Integer()
