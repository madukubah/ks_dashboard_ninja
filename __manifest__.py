# -*- coding: utf-8 -*-

{
    'name': 'Dashboard Ninja',
    'version': '1.0',
    'author': 'Technoindo.com',
    'category': 'Dashboard',
    'depends': [
    ],
    'data': [
        'data/ks_default_data.xml',

        'views/ks_dashboard_ninja_assets.xml',
        'views/ks_dashboard_ninja_item_view.xml',
        'views/ks_dashboard_ninja.xml',
        'views/menu.xml',
    ],
    'qweb': [
        'static/src/xml/ks_dashboard_ninja_templates.xml',
        'static/src/xml/ks_dashboard_ninja_item_templates.xml',
        'static/src/xml/tmpl.xml',
    ],
    'demo': [
        # 'demo/sale_agent_demo.xml',
    ],
    "installable": True,
	"auto_instal": False,
	"application": True,
}
