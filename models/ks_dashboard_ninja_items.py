# -*- coding: utf-8 -*-

from odoo import models, fields, api
import json
from datetime import datetime
from ..lib.ks_date_filter_selections import ks_get_date
import logging
_logger = logging.getLogger(__name__)

class KsDashboardNinjaItems(models.Model):
    _name = 'ks_dashboard_ninja.item'

    name = fields.Char(string="Name", size=256)
    ks_model_id = fields.Many2one('ir.model', string='Model', required=True,
                                  domain="[('access_ids','!=',False),('transient','=',False),('model','not ilike','base_import%'),('model','not ilike','ir.%'),('model','not ilike','web_editor.%'),('model','not ilike','web_tour.%'),('model','!=','mail.thread'),('model','not ilike','ks_dash%')]")
    ks_domain = fields.Char(string="Domain")    
    # This field main purpose is to store %UID as current user id. Mainly used in JS file as container.
    ks_domain_temp = fields.Char(string="Domain Substitute")
    ks_layout = fields.Selection([('layout1', 'Layout 1'),
                                  ('layout2', 'Layout 2'),
                                  ('layout3', 'Layout 3'),
                                  ('layout4', 'Layout 4'),
                                  ('layout5', 'Layout 5'),
                                  ('layout6', 'Layout 6'),
                                  ], default=('layout1'), required=True, string="Layout")
    ks_preview = fields.Integer(default=1, string="Preview")
    ks_model_name = fields.Char(related='ks_model_id.model')
    ks_record_count_type = fields.Selection([('count', 'Count'),
                                             ('sum', 'Sum'),
                                             ('average', 'Average')], string="Record Count Type", default="count")
    ks_chart_measure_field = fields.Many2many('ir.model.fields', 'ks_dn_measure_field_rel', 'measure_field_id',
                                              'field_id',
                                              domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),'|','|',"
                                                     "('ttype','=','integer'),('ttype','=','float'),"
                                                     "('ttype','=','monetary')]",
                                              string="Measure 1")

    ks_chart_measure_field_2 = fields.Many2many('ir.model.fields', 'ks_dn_measure_field_rel_2', 'measure_field_id_2',
                                              'field_id',
                                              domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),'|','|',"
                                                     "('ttype','=','integer'),('ttype','=','float'),"
                                                     "('ttype','=','monetary')]",
                                              string="Line Measure")

    ks_record_count = fields.Float(string="Record Count", compute='ks_get_record_count', readonly=True)
    ks_record_field = fields.Many2one('ir.model.fields',
                                      domain="[('model_id','=',ks_model_id),('name','!=','id'),'|','|',('ttype','=','integer'),('ttype','=','float'),('ttype','=','monetary')]",
                                      string="Record Field")

    # Date Filter Fields
    # Condition to tell if date filter is applied or not
    ks_isDateFilterApplied = fields.Boolean(default=False)

    # ---------------------------- Date Filter Fields ------------------------------------------
    ks_date_filter_field = fields.Many2one('ir.model.fields',
                                           domain="[('model_id','=',ks_model_id),'|',('ttype','=','date'),('ttype','=','datetime')]",
                                           string="Date Filter Field")
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
    ], default='l_none', string="Date Filter Selection")

    ks_item_start_date = fields.Datetime(string="Start Date")
    ks_item_end_date = fields.Datetime(string="End Date")

    # ------------------------ Pro Fields --------------------
    ks_dashboard_ninja_board_id = fields.Many2one('ks_dashboard_ninja.board',
                                                  default=lambda self: self._context[
                                                      'ks_dashboard_id'] if 'ks_dashboard_id' in self._context else False)
                              
    # Chart related fields
    ks_dashboard_item_type = fields.Selection([('ks_tile', 'Tile'),
                                               ('ks_bar_chart', 'Bar Chart'),
                                               ('ks_horizontalBar_chart', 'Horizontal Bar Chart'),
                                               ('ks_line_chart', 'Line Chart'),
                                               ('ks_area_chart', 'Area Chart'),
                                               ('ks_pie_chart', 'Pie Chart'),
                                               ('ks_doughnut_chart', 'Doughnut Chart'),
                                               ('ks_polarArea_chart', 'Polar Area Chart'),
                                               ('ks_list_view', 'List View'),
                                               ], default=lambda self: self._context.get('ks_dashboard_item_type',
                                                                                         'ks_tile'), required=True,
                                              string="Dashboard Item Type")
    ks_chart_groupby_type = fields.Char(compute='get_chart_groupby_type')
    ks_chart_sub_groupby_type = fields.Char(compute='get_chart_sub_groupby_type')
    ks_chart_relation_groupby = fields.Many2one('ir.model.fields',
                                                domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),'|',"
                                                       "'|',('ttype','=','many2one'),('ttype','=','date'),('ttype','=','datetime')]",
                                                string="Group By")
    ks_chart_relation_sub_groupby = fields.Many2one('ir.model.fields',
                                                    domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),'|',"
                                                           "'|',('ttype','=','many2one'),('ttype','=','date'),('ttype','=','datetime')]",
                                                    string=" Sub Group By")
    ks_chart_date_groupby = fields.Selection([('day', 'Day'),
                                              ('week', 'Week'),
                                              ('month', 'Month'),
                                              ('quarter', 'Quarter'),
                                              ('year', 'Year'),
                                              ], string="Dashboard Item Chart Group By Type")
    ks_chart_date_sub_groupby = fields.Selection([('day', 'Day'),
                                                  ('week', 'Week'),
                                                  ('month', 'Month'),
                                                  ('quarter', 'Quarter'),
                                                  ('year', 'Year'),
                                                  ], string="Dashboard Item Chart Sub Group By Type")
    ks_chart_data_count_type = fields.Selection([('count', 'Count'),('sum', 'Sum'), ('average', 'Average')],
                                                string="Data Type", default="sum")
    ks_sort_by_field = fields.Many2one('ir.model.fields',
                                       domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),"
                                              "('ttype','!=','one2many'),('ttype','!=','many2one'),('ttype','!=','binary')]",
                                       string="Sort By Field")
    ks_sort_by_order = fields.Selection([('ASC', 'Ascending'), ('DESC', 'Descending')],
                                        string="Sort Order")
    ks_record_data_limit = fields.Integer(string="Record Limit")
    # ------------------------ List View Fields ------------------------------

    ks_list_view_type = fields.Selection([('ungrouped', 'Un-Grouped'), ('grouped', 'Grouped')], default="ungrouped",
                                         string="List View Type", required=True)
    ks_list_view_fields = fields.Many2many('ir.model.fields', 'ks_dn_list_field_rel', 'list_field_id', 'field_id',
                                           domain="[('model_id','=',ks_model_id),('store','=',True),"
                                                  "('ttype','!=','one2many'),('ttype','!=','many2many'),('ttype','!=','binary')]",
                                           string="Fields to show in list")

    ks_list_view_group_fields = fields.Many2many('ir.model.fields', 'ks_dn_list_group_field_rel', 'list_field_id',
                                                 'field_id',
                                                 domain="[('model_id','=',ks_model_id),('name','!=','id'),('store','=',True),'|','|',"
                                                        "('ttype','=','integer'),('ttype','=','float'),"
                                                        "('ttype','=','monetary')]",
                                                 string="List View Grouped Fields")


    # -------------------- Multi Company Feature ---------------------
    ks_company_id = fields.Many2one('res.company', string='Company', default=lambda self: self.env.user.company_id)

    @api.multi
    @api.depends('ks_record_count_type', 'ks_model_id', 'ks_domain', 'ks_record_field','ks_date_filter_field','ks_item_end_date','ks_item_start_date')
    def ks_get_record_count(self):
        for rec in self:
            if rec.ks_record_count_type == 'count':
                rec.ks_record_count = rec.ks_fetch_model_data(rec.ks_model_name, rec.ks_domain, 'search_count', rec)
            elif rec.ks_record_count_type == 'sum' and rec.ks_record_field:
                ks_records = rec.ks_fetch_model_data(rec.ks_model_name, rec.ks_domain, 'search', rec)
                for filtered_records in ks_records:
                    rec.ks_record_count += filtered_records[rec.ks_record_field.name]
            elif rec.ks_record_count_type == 'average' and rec.ks_record_field:
                ks_records = rec.ks_fetch_model_data(rec.ks_model_name, rec.ks_domain, 'search', rec)
                ks_record_count = rec.ks_fetch_model_data(rec.ks_model_name, rec.ks_domain, 'search_count', rec)
                for filtered_records in ks_records:
                    rec.ks_record_count += filtered_records[rec.ks_record_field.name]
                rec.ks_record_count = rec.ks_record_count / ks_record_count if ks_record_count else 0
            else:
                rec.ks_record_count = 0

    @api.multi
    @api.onchange('ks_chart_relation_groupby')
    def get_chart_groupby_type(self):
        for rec in self:
            if rec.ks_chart_relation_groupby.ttype == 'datetime' or rec.ks_chart_relation_groupby.ttype == 'date':
                rec.ks_chart_groupby_type = 'date_type'
            elif rec.ks_chart_relation_groupby.ttype == 'many2one':
                rec.ks_chart_groupby_type = 'relational_type'
                rec.ks_chart_date_groupby = False
            else:
                rec.ks_chart_groupby_type = 'none'
                rec.ks_chart_date_groupby = False

    @api.multi
    @api.onchange('ks_chart_relation_sub_groupby')
    def get_chart_sub_groupby_type(self):
        for rec in self:
            if rec.ks_chart_relation_sub_groupby.ttype == 'datetime' or rec.ks_chart_relation_sub_groupby.ttype == 'date':
                rec.ks_chart_sub_groupby_type = 'date_type'
            elif rec.ks_chart_relation_sub_groupby.ttype == 'many2one':
                rec.ks_chart_sub_groupby_type = 'relational_type'
                rec.ks_chart_date_sub_groupby = False
            else:
                rec.ks_chart_sub_groupby_type = 'none'
                rec.ks_chart_date_sub_groupby = False

    # Writing separate function to fetch dashboard item data
    def ks_fetch_model_data(self, ks_model_name, ks_domain, ks_func, rec):
        data = 0
        _logger.warning( ks_model_name )
        try:
            if ks_domain and ks_domain != '[]' and ks_model_name:
                proper_domain = self.ks_convert_into_proper_domain(ks_domain, rec)
                if ks_func == 'search_count':
                    data = self.env[ks_model_name].search_count(proper_domain)
                elif ks_func == 'search':
                    data = self.env[ks_model_name].search(proper_domain)
            elif ks_model_name:
                # Have to put extra if condition here because on load,model giving False value
                proper_domain = self.ks_convert_into_proper_domain(False, rec)
                if ks_func == 'search_count':
                    data = self.env[ks_model_name].search_count(proper_domain)

                elif ks_func == 'search':
                    data = self.env[ks_model_name].search(proper_domain)
            else:
                return 0
        except Exception as e:
            return 0
        return data

    def ks_convert_into_proper_domain(self, ks_domain, rec):
        if ks_domain and "%UID" in ks_domain:
            ks_domain = ks_domain.replace('"%UID"', str(self.env.user.id))
        if not rec.ks_date_filter_selection:
            selected_start_date = rec.env["ks_dashboard_ninja.board"].browse(
                rec.ks_dashboard_ninja_board_id.id).ks_dashboard_start_date
            selected_end_date = rec.env["ks_dashboard_ninja.board"].browse(
                rec.ks_dashboard_ninja_board_id.id).ks_dashboard_end_date
        else:
            selected_start_date = rec.ks_item_start_date
            selected_end_date = rec.ks_item_end_date
        if ks_domain:
            # try:
            proper_domain = eval(ks_domain)
            if selected_start_date and selected_end_date and rec.ks_date_filter_field:
                proper_domain.extend([(rec.ks_date_filter_field.name, ">=", selected_start_date),
                                      (rec.ks_date_filter_field.name, "<=", selected_end_date)])
                rec.ks_isDateFilterApplied = True
            else:
                rec.ks_isDateFilterApplied = False
        else:
            if selected_start_date and selected_end_date and rec.ks_date_filter_field:
                proper_domain = [(rec.ks_date_filter_field.name, ">=", selected_start_date),
                                 (rec.ks_date_filter_field.name, "<=", selected_end_date)]
            else:
                proper_domain = []
        return proper_domain

