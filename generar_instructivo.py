#!/usr/bin/env python3
"""Genera el instructivo PDF para la app Arreglos de la Escuela."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas
import os

# ── Colores ──
INDIGO = HexColor('#4f46e5')
INDIGO_DARK = HexColor('#3730a3')
INDIGO_LIGHT = HexColor('#e0e7ff')
PURPLE = HexColor('#7c3aed')
EMERALD = HexColor('#059669')
EMERALD_LIGHT = HexColor('#d1fae5')
AMBER = HexColor('#d97706')
AMBER_LIGHT = HexColor('#fef3c7')
SLATE_800 = HexColor('#1e293b')
SLATE_600 = HexColor('#475569')
SLATE_400 = HexColor('#94a3b8')
SLATE_100 = HexColor('#f1f5f9')
WHITE = white

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'public', 'instructivo.pdf')


# ── Estilos ──
def get_styles():
    return {
        'title': ParagraphStyle(
            'Title', fontName='Helvetica-Bold', fontSize=28,
            textColor=WHITE, alignment=TA_CENTER, leading=34,
            spaceAfter=6,
        ),
        'subtitle': ParagraphStyle(
            'Subtitle', fontName='Helvetica', fontSize=13,
            textColor=HexColor('#a5b4fc'), alignment=TA_CENTER,
            leading=18, spaceAfter=20,
        ),
        'h1': ParagraphStyle(
            'H1', fontName='Helvetica-Bold', fontSize=18,
            textColor=INDIGO_DARK, spaceBefore=24, spaceAfter=10,
            leading=22,
        ),
        'h2': ParagraphStyle(
            'H2', fontName='Helvetica-Bold', fontSize=14,
            textColor=INDIGO, spaceBefore=16, spaceAfter=8,
            leading=18,
        ),
        'body': ParagraphStyle(
            'Body', fontName='Helvetica', fontSize=11,
            textColor=SLATE_800, leading=16, spaceAfter=8,
        ),
        'body_center': ParagraphStyle(
            'BodyCenter', fontName='Helvetica', fontSize=11,
            textColor=SLATE_800, leading=16, spaceAfter=8,
            alignment=TA_CENTER,
        ),
        'bullet': ParagraphStyle(
            'Bullet', fontName='Helvetica', fontSize=11,
            textColor=SLATE_800, leading=16, spaceAfter=4,
            leftIndent=20, bulletIndent=8,
        ),
        'step_num': ParagraphStyle(
            'StepNum', fontName='Helvetica-Bold', fontSize=12,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        'step_text': ParagraphStyle(
            'StepText', fontName='Helvetica', fontSize=11,
            textColor=SLATE_800, leading=16,
        ),
        'tip': ParagraphStyle(
            'Tip', fontName='Helvetica-Oblique', fontSize=10,
            textColor=SLATE_600, leading=14, spaceAfter=6,
            leftIndent=12,
        ),
        'url': ParagraphStyle(
            'URL', fontName='Helvetica-Bold', fontSize=13,
            textColor=INDIGO, alignment=TA_CENTER, spaceAfter=12,
        ),
        'small': ParagraphStyle(
            'Small', fontName='Helvetica', fontSize=9,
            textColor=SLATE_400, alignment=TA_CENTER, leading=12,
        ),
        'footer': ParagraphStyle(
            'Footer', fontName='Helvetica', fontSize=8,
            textColor=SLATE_400, alignment=TA_CENTER,
        ),
    }


# ── Header/Footer en cada página ──
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        super().showPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_page_footer(num_pages)
            super().showPage()
        super().save()

    def _draw_page_footer(self, total):
        page = self._pageNumber
        if page == 1:
            return
        self.setFont('Helvetica', 8)
        self.setFillColor(SLATE_400)
        w, _ = A4
        self.drawCentredString(w / 2, 20 * mm, f"Arreglos de la Escuela — Instructivo de uso — Pag {page}/{total}")


# ── Step block ──
def make_step(num, title, description, styles):
    """Crea una fila de paso con numero circular + texto."""
    num_para = Paragraph(str(num), styles['step_num'])
    text = f"<b>{title}</b><br/>{description}"
    text_para = Paragraph(text, styles['step_text'])

    t = Table(
        [[num_para, text_para]],
        colWidths=[1.2 * cm, 14.5 * cm],
        rowHeights=[None],
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), INDIGO),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (0, 0), 6),
        ('BOTTOMPADDING', (0, 0), (0, 0), 6),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (0, 0), (0, 0), 4),
        ('TOPPADDING', (1, 0), (1, 0), 4),
        ('BOTTOMPADDING', (1, 0), (1, 0), 8),
        ('LEFTPADDING', (1, 0), (1, 0), 10),
    ]))
    return t


def make_tip_box(text, styles, color=INDIGO_LIGHT, text_color=INDIGO_DARK):
    """Crea un recuadro de tip/nota."""
    para = Paragraph(text, ParagraphStyle(
        'TipBox', fontName='Helvetica', fontSize=10,
        textColor=text_color, leading=14,
    ))
    t = Table([[para]], colWidths=[15.5 * cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), color),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
    ]))
    return t


def build_cover(story, styles):
    """Página de portada."""
    story.append(Spacer(1, 3 * cm))

    # Banner superior
    cover_data = [['']]
    cover_table = Table(cover_data, colWidths=[16 * cm], rowHeights=[8 * cm])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INDIGO),
        ('ROUNDEDCORNERS', [16, 16, 16, 16]),
    ]))

    # Usamos un enfoque diferente: texto directo
    story.append(Spacer(1, 2 * cm))

    # Titulo grande
    title_table_data = [
        [Paragraph("Arreglos de la Escuela", styles['title'])],
        [Spacer(1, 4)],
        [Paragraph("Instructivo de uso", ParagraphStyle(
            'CoverSub', fontName='Helvetica', fontSize=16,
            textColor=INDIGO_LIGHT, alignment=TA_CENTER, leading=20,
        ))],
        [Spacer(1, 16)],
        [Paragraph("arreglos-escuela.vercel.app", ParagraphStyle(
            'CoverURL', fontName='Helvetica-Bold', fontSize=12,
            textColor=WHITE, alignment=TA_CENTER,
            backColor=HexColor('#3730a3'),
        ))],
    ]
    title_table = Table(title_table_data, colWidths=[16 * cm])
    title_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INDIGO),
        ('ROUNDEDCORNERS', [16, 16, 16, 16]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('TOPPADDING', (0, 0), (0, 0), 40),
        ('BOTTOMPADDING', (0, -1), (0, -1), 40),
    ]))
    story.append(title_table)

    story.append(Spacer(1, 2 * cm))
    story.append(Paragraph(
        "Aplicacion web para gestionar las tareas de mantenimiento y reparaciones de la escuela. "
        "Funciona desde cualquier dispositivo con acceso a internet.",
        styles['body_center']
    ))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(
        "Desarrollado por <b>Tecnoaid</b> — Tech Repair &amp; Digital Solutions",
        styles['body_center']
    ))
    story.append(Paragraph("tecnoaid.ar | @tecno.aid", styles['small']))

    story.append(PageBreak())


def build_access(story, styles):
    """Seccion: Como acceder."""
    story.append(Paragraph("1. Como acceder a la aplicacion", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    story.append(Paragraph(
        "La aplicacion funciona desde cualquier navegador web (Chrome, Safari, Firefox) "
        "en celulares, tablets y computadoras.",
        styles['body']
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Desde el navegador", styles['h2']))

    story.append(make_step(1, "Abrir el navegador",
        "Abri Chrome, Safari u otro navegador en tu dispositivo.", styles))
    story.append(Spacer(1, 6))
    story.append(make_step(2, "Ingresar la direccion",
        "Escribi en la barra de direcciones: <b>arreglos-escuela.vercel.app</b>", styles))
    story.append(Spacer(1, 6))
    story.append(make_step(3, "Listo!",
        "Ya podes ver y gestionar todas las tareas de arreglos.", styles))

    story.append(Spacer(1, 12))
    story.append(make_tip_box(
        "<b>Consejo:</b> Guarda la pagina en favoritos para acceder mas rapido la proxima vez.",
        styles
    ))

    story.append(Spacer(1, 16))
    story.append(Paragraph("Instalar como app en el celular (recomendado)", styles['h2']))
    story.append(Paragraph(
        "Podes instalar la app en la pantalla de inicio de tu celular para que se abra "
        "como si fuera una aplicacion nativa, sin barra del navegador.",
        styles['body']
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>En Android (Chrome):</b>", styles['body']))
    story.append(make_step(1, "Abrir en Chrome",
        "Ingresa a <b>arreglos-escuela.vercel.app</b>", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(2, "Menu",
        "Toca los 3 puntos de arriba a la derecha.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(3, "Instalar",
        "Selecciona <b>\"Agregar a pantalla de inicio\"</b> o <b>\"Instalar aplicacion\"</b>.", styles))

    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>En iPhone (Safari):</b>", styles['body']))
    story.append(make_step(1, "Abrir en Safari",
        "Ingresa a <b>arreglos-escuela.vercel.app</b>", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(2, "Compartir",
        "Toca el icono de compartir (cuadrado con flecha hacia arriba).", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(3, "Agregar",
        "Selecciona <b>\"Agregar a pantalla de inicio\"</b>.", styles))

    story.append(PageBreak())


def build_tasks(story, styles):
    """Seccion: Gestionar tareas."""
    story.append(Paragraph("2. Ver y completar tareas", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    story.append(Paragraph(
        "Al entrar a la app vas a ver todas las tareas de arreglos organizadas por secciones "
        "(Informatica, Plomeria, Cerrajeria, etc.).",
        styles['body']
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Marcar una tarea como completada", styles['h2']))
    story.append(Paragraph(
        "Para marcar que un arreglo ya se hizo, simplemente <b>toca la tarea</b> o el "
        "<b>checkbox</b> que esta a la izquierda. La tarea se va a tachar y ponerse en verde.",
        styles['body']
    ))
    story.append(make_tip_box(
        "<b>Importante:</b> Los cambios se sincronizan en tiempo real. Si alguien marca una tarea "
        "como hecha desde otro celular, vas a ver el cambio automaticamente sin recargar la pagina.",
        styles
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Filtrar tareas", styles['h2']))
    story.append(Paragraph(
        "Arriba de la lista hay tres botones de filtro:",
        styles['body']
    ))

    filter_data = [
        [Paragraph("<b>Todas</b>", styles['body']),
         Paragraph("Muestra todas las tareas", styles['body'])],
        [Paragraph("<b>Pendientes</b>", styles['body']),
         Paragraph("Solo las que faltan hacer", styles['body'])],
        [Paragraph("<b>Completadas</b>", styles['body']),
         Paragraph("Solo las que ya se hicieron", styles['body'])],
    ]
    filter_table = Table(filter_data, colWidths=[4 * cm, 11.7 * cm])
    filter_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), INDIGO_LIGHT),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, SLATE_100),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(filter_table)

    story.append(Spacer(1, 12))
    story.append(Paragraph("Barra de progreso", styles['h2']))
    story.append(Paragraph(
        "En la parte superior (header violeta) hay una barra de progreso que muestra "
        "cuantas tareas se completaron del total. Se actualiza automaticamente.",
        styles['body']
    ))

    story.append(PageBreak())


def build_crud(story, styles):
    """Seccion: Crear, editar y eliminar."""
    story.append(Paragraph("3. Crear, editar y eliminar", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    # Secciones
    story.append(Paragraph("Secciones (categorias)", styles['h2']))
    story.append(Paragraph(
        "Las secciones agrupan las tareas por tipo de arreglo (ej: Plomeria, Electricidad, etc.).",
        styles['body']
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Crear una seccion:</b>", styles['body']))
    story.append(make_step(1, "Boton \"Nueva seccion\"",
        "Toca el boton violeta <b>\"Nueva seccion\"</b> que esta arriba a la derecha.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(2, "Elegir icono y nombre",
        "Selecciona un icono tocando el cuadrado de la izquierda, y escribi el nombre de la seccion.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(3, "Crear",
        "Toca el boton <b>\"Crear\"</b>. La seccion aparece al final de la lista.", styles))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Editar o eliminar una seccion:</b>", styles['body']))
    story.append(Paragraph(
        "En celular, los botones de editar (lapiz) y eliminar (tacho) aparecen a la derecha "
        "del nombre de la seccion. En computadora, aparecen al pasar el mouse por encima.",
        styles['body']
    ))
    story.append(make_tip_box(
        "<b>Atencion:</b> Al eliminar una seccion se eliminan tambien todas sus tareas. "
        "Se va a pedir confirmacion antes de borrar.",
        styles, color=AMBER_LIGHT, text_color=HexColor('#92400e')
    ))

    story.append(Spacer(1, 16))

    # Tareas
    story.append(Paragraph("Tareas", styles['h2']))

    story.append(Paragraph("<b>Crear una tarea:</b>", styles['body']))
    story.append(make_step(1, "Boton \"Agregar tarea\"",
        "Debajo de cada seccion hay un boton con linea punteada que dice <b>\"Agregar tarea\"</b>. "
        "Tambien se puede usar el icono <b>+</b> en el encabezado de la seccion.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(2, "Completar el formulario",
        "Escribi la <b>descripcion</b> del arreglo (obligatorio). "
        "Opcionalmente podes agregar la <b>ubicacion</b> y quien lo <b>reporto</b>.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(3, "Crear",
        "Toca <b>\"Crear\"</b> y la tarea aparece en la seccion.", styles))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Editar o eliminar una tarea:</b>", styles['body']))
    story.append(Paragraph(
        "Cada tarea tiene botones de editar (lapiz) y eliminar (tacho) a la derecha. "
        "En celular son siempre visibles; en computadora aparecen al pasar el mouse.",
        styles['body']
    ))

    story.append(PageBreak())


def build_theme(story, styles):
    """Seccion: Tema claro/oscuro."""
    story.append(Paragraph("4. Tema claro y oscuro", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    story.append(Paragraph(
        "La app tiene modo claro y modo oscuro. Para cambiar entre uno y otro:",
        styles['body']
    ))
    story.append(make_step(1, "Boton de tema",
        "En el header violeta, arriba a la derecha, hay un icono de <b>sol/luna</b>.", styles))
    story.append(Spacer(1, 4))
    story.append(make_step(2, "Tocar para cambiar",
        "Toca el icono para alternar entre modo claro y oscuro. "
        "La preferencia se guarda automaticamente.", styles))

    story.append(Spacer(1, 16))

    story.append(Paragraph("5. Sincronizacion en tiempo real", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    story.append(Paragraph(
        "Todos los cambios que se hagan en la app se sincronizan <b>automaticamente</b> "
        "en todos los dispositivos conectados. No hace falta recargar la pagina.",
        styles['body']
    ))

    story.append(Spacer(1, 8))

    sync_data = [
        [Paragraph("<b>Que se sincroniza</b>", ParagraphStyle('SH', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE)),
         Paragraph("<b>Ejemplo</b>", ParagraphStyle('SH', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE))],
        [Paragraph("Marcar tarea como hecha", styles['body']),
         Paragraph("Alguien tilda una tarea y todos la ven tachada", styles['body'])],
        [Paragraph("Crear tarea o seccion", styles['body']),
         Paragraph("Se agrega una nueva tarea y aparece en todos los dispositivos", styles['body'])],
        [Paragraph("Editar tarea o seccion", styles['body']),
         Paragraph("Se modifica un texto y se actualiza en todas las pantallas", styles['body'])],
        [Paragraph("Eliminar tarea o seccion", styles['body']),
         Paragraph("Se borra algo y desaparece de todos los dispositivos", styles['body'])],
    ]
    sync_table = Table(sync_data, colWidths=[6 * cm, 9.7 * cm])
    sync_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), INDIGO),
        ('BACKGROUND', (0, 1), (-1, -1), SLATE_100),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e2e8f0')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, SLATE_100]),
    ]))
    story.append(sync_table)

    story.append(Spacer(1, 16))
    story.append(make_tip_box(
        "<b>Indicador de sincronizacion:</b> En el header vas a ver un punto verde con el texto "
        "\"Sincronizado\" que confirma que la conexion en tiempo real esta activa.",
        styles
    ))

    story.append(PageBreak())


def build_faq(story, styles):
    """Seccion: Preguntas frecuentes."""
    story.append(Paragraph("6. Preguntas frecuentes", styles['h1']))
    story.append(HRFlowable(width="100%", thickness=1, color=INDIGO_LIGHT, spaceAfter=12))

    faqs = [
        ("Necesito crear una cuenta para usar la app?",
         "No. La app no requiere registro ni contrasena. Cualquier persona con el link puede acceder."),
        ("Funciona sin internet?",
         "La app necesita conexion a internet para cargar las tareas y sincronizar cambios. "
         "Si perdes la conexion momentaneamente, podes seguir viendo lo que ya cargo."),
        ("Puedo usarla desde el celular?",
         "Si! Funciona desde cualquier celular, tablet o computadora. Recomendamos instalarla "
         "como app (ver seccion 1) para mejor experiencia."),
        ("Que pasa si dos personas editan al mismo tiempo?",
         "La app maneja los cambios en tiempo real. Cada cambio se guarda individualmente, "
         "asi que no hay conflictos."),
        ("Puedo deshacer si borre algo por error?",
         "No hay boton de deshacer. Antes de eliminar, la app pide confirmacion. "
         "Si borraste algo, podes volver a crearlo manualmente."),
        ("Quien puede ver y modificar las tareas?",
         "Cualquier persona con acceso al link. No hay roles ni permisos diferenciados."),
    ]

    for q, a in faqs:
        story.append(Paragraph(f"<b>{q}</b>", styles['body']))
        story.append(Paragraph(a, ParagraphStyle(
            'Answer', fontName='Helvetica', fontSize=11,
            textColor=SLATE_600, leading=16, spaceAfter=12,
            leftIndent=12,
        )))

    story.append(Spacer(1, 16))

    # Contacto final
    contact_data = [
        [Paragraph(
            "<b>Necesitas ayuda?</b><br/><br/>"
            "Contacta a <b>Tecnoaid</b> para soporte tecnico:<br/>"
            "Web: <b>tecnoaid.ar</b><br/>"
            "Instagram: <b>@tecno.aid</b>",
            ParagraphStyle('Contact', fontName='Helvetica', fontSize=11,
                          textColor=INDIGO_DARK, leading=16)
        )],
    ]
    contact_table = Table(contact_data, colWidths=[15.5 * cm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INDIGO_LIGHT),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ('TOPPADDING', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(contact_table)


def main():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title="Arreglos de la Escuela - Instructivo de uso",
        author="Tecnoaid",
    )

    styles = get_styles()
    story = []

    build_cover(story, styles)
    build_access(story, styles)
    build_tasks(story, styles)
    build_crud(story, styles)
    build_theme(story, styles)
    build_faq(story, styles)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Instructivo generado en: {OUTPUT_PATH}")


if __name__ == '__main__':
    main()
