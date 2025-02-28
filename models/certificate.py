from datetime import datetime, timedelta

from peewee import AutoField, CharField, IntegerField, DateField, Model, SqliteDatabase, SQL, BooleanField

db = SqliteDatabase('certificates.db')


def initialize_db() -> None:
    db.connect()
    db.create_tables([Certificate], safe=True)


class Certificate(Model):
    id = AutoField(primary_key=True, constraints=[SQL('AUTOINCREMENT')])
    service = CharField()
    holder = CharField()
    phone = CharField()
    value = IntegerField()
    expires = DateField()
    is_percents = BooleanField(default=False)

    class Meta:
        database = db

    @classmethod
    def create_certificate(cls, service: str, holder: str, phone: str, value: int, is_percents: bool):
        expires = datetime.now() + timedelta(days=60)
        certificate = cls.create(service=service, holder=holder, phone=phone, value=value, expires=expires, is_percents=is_percents)
        certificate.save()

        return certificate

    @classmethod
    def get_all_certificates_as_dictionaries(cls) -> list[dict[str, str]]:
        return [
            {
                "id": str(certificate.id),
                "service": certificate.service,
                "holder": certificate.holder,
                "phone": certificate.phone,
                "value": str(certificate.value),
                "expires": certificate.expires.strftime("%Y-%m-%d"),
                "is_percents": certificate.is_percents,
            }
            for certificate in cls.select().order_by(cls.expires.desc())
        ]

    @classmethod
    def delete_certificate_by_id(cls, id: int) -> None:
        cls.delete().where(cls.id == id).execute()