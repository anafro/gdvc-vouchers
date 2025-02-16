from datetime import datetime, timedelta

from peewee import AutoField, CharField, IntegerField, DateField, Model, SqliteDatabase

db = SqliteDatabase('vouchers.db')

def initialize_db() -> None:
    db.connect()
    db.create_tables([Certificate], safe=True)


class Certificate(Model):
    id = AutoField(primary_key=True)
    service = CharField()
    holder = CharField()
    phone = CharField()
    value = IntegerField()
    expires = DateField()

    class Meta:
        database = db

    @classmethod
    def create_certificate(cls, service, holder, phone, value):
        expires = datetime.now() + timedelta(days=60)
        certificate = cls.create(service=service, holder=holder, phone=phone, value=value, expires=expires)
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
                "expires": certificate.expires.strftime("%Y-%m-%d")
            }
            for certificate in cls.select()
        ]
