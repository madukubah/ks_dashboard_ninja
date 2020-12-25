 # -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class KsDashboardNinjaBoard(models.Model):
    _name = 'ks_dashboard_ninja.board'

    name = fields.Char(string="Dashboard Name", required=True, size=35)
    ks_dashboard_state = fields.Char()
    ks_dashboard_menu_name = fields.Char(string="Menu Name")
    ks_dashboard_top_menu_id = fields.Many2one('ir.ui.menu', domain="[('parent_id','=',False)]",
                                               string="Show Under Menu")

    ks_dashboard_active = fields.Boolean(string="Active", default=True)
    ks_dashboard_group_access = fields.Many2many('res.groups', string="Group Access")
    
    # ks_dashboard_default_template = fields.Many2one('ks_dashboard_ninja.board_template',
    #                                                 default=lambda self: self.env.ref('ks_dashboard_ninja.ks_blank',False),
    #                                                 string="Dashboard Template", required=True)
    
    ks_set_interval = fields.Selection([
        (15000, '15 Seconds'),
        (30000, '30 Seconds'),
        (45000, '45 Seconds'),
        (60000, '1 minute'),
        (120000, '2 minute'),
        (300000, '5 minute'),
        (600000, '10 minute'),
    ], string="Update Interval")

class KsDashboardNinjaTemplate(models.Model):
    _name = 'ks_dashboard_ninja.board_template'

    name = fields.Char()
    ks_gridstack_config = fields.Char()
    ks_item_count = fields.Integer()
