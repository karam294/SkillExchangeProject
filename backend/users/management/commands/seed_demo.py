from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

User = get_user_model()
Skill = apps.get_model('skills', 'Skill')
Offer = apps.get_model('offers', 'Offer')
Request = apps.get_model('requests', 'Request')
Review = apps.get_model('reviews', 'Review')

DEMO_PASSWORD = 'demo12345'

DEMO_SKILLS = [
    ('[demo] Guitar lessons', 'Music', 'Beginner-friendly acoustic guitar — chords, strumming, and simple songs.'),
    ('[demo] Python tutoring', 'Technology', 'Python basics, data structures, and small projects.'),
    ('[demo] Resume & interview coaching', 'Career', 'Resume review, mock interviews, and negotiation tips.'),
    ('[demo] Home cooking basics', 'Lifestyle', 'Knife skills, meal prep, and five staple recipes.'),
    ('[demo] Math homework help', 'Education', 'Algebra through calculus — homework and exam prep.'),
]

# username, email, first_name, last_name, bio
DEMO_PEOPLE = [
    (
        'demo_alice',
        'alice.demo@example.com',
        'Alice',
        'Anderson',
        'Music teacher with 10 years experience.',
    ),
    (
        'demo_bob',
        'bob.demo@example.com',
        'Bob',
        'Brown',
        'Software developer and weekend Python mentor.',
    ),
    (
        'demo_carol',
        'carol.demo@example.com',
        'Carol',
        'Chen',
        'HR coach helping people land better roles.',
    ),
    (
        'demo_dave',
        'dave.demo@example.com',
        'Dave',
        'Diaz',
        'Chef and cooking workshop host.',
    ),
]


class Command(BaseCommand):
    help = (
        'Creates demo users, skills, offers, requests, and reviews for testing. '
        f'Removes previous demo_* users and [demo] skills first. Password for all demo users: {DEMO_PASSWORD}'
    )

    def handle(self, *args, **options):
        with transaction.atomic():
            n_users, _ = User.objects.filter(username__startswith='demo_').delete()
            n_skills, _ = Skill.objects.filter(title__startswith='[demo]').delete()
            if n_users or n_skills:
                self.stdout.write(self.style.WARNING('Cleared prior demo_* users and [demo] skills.'))

            skills = []
            for title, category, description in DEMO_SKILLS:
                skills.append(Skill.objects.create(title=title, category=category, description=description))

            users = {}
            for username, email, first_name, last_name, bio in DEMO_PEOPLE:
                users[username] = User.objects.create_user(
                    username=username,
                    email=email,
                    password=DEMO_PASSWORD,
                    first_name=first_name,
                    last_name=last_name,
                    bio=bio,
                )

            alice = users['demo_alice']
            bob = users['demo_bob']
            carol = users['demo_carol']
            dave = users['demo_dave']

            # Offers: Alice — guitar; Bob — python; Carol — career; Dave — cooking; Alice — math
            o_alice_guitar = Offer.objects.create(
                user=alice,
                skill=skills[0],
                price=35.0,
                availability='Weekends',
                description='60-minute sessions at my studio or online.',
            )
            Offer.objects.create(
                user=bob,
                skill=skills[1],
                price=50.0,
                availability='Evenings (UTC)',
                description='Pair programming and exercises tailored to your goals.',
            )
            Offer.objects.create(
                user=carol,
                skill=skills[2],
                price=45.0,
                availability='Weekday afternoons',
                description='Two mock interviews included in the package.',
            )
            Offer.objects.create(
                user=dave,
                skill=skills[3],
                price=30.0,
                availability='Saturday mornings',
                description='Small group workshop (max 4 people).',
            )
            o_alice_math = Offer.objects.create(
                user=alice,
                skill=skills[4],
                price=40.0,
                availability='Flexible',
                description='High school and early college math.',
            )

            # Requests
            Request.objects.create(
                requester=bob,
                offer=o_alice_guitar,
                message='Hi Alice, I am a complete beginner and free Saturday afternoons. Can we start next week?',
                status='pending',
            )
            Request.objects.create(
                requester=carol,
                offer=o_alice_guitar,
                message='Looking for a few lessons before a camp sing-along. Thanks!',
                status='pending',
            )
            Request.objects.create(
                requester=dave,
                offer=o_alice_math,
                message='Need help with derivatives for a test — urgent but happy to pay for two sessions.',
                status='accepted',
            )

            # Reviews
            Review.objects.create(
                reviewer=bob,
                reviewed_user=alice,
                rating=5,
                comment='Patient and clear — I can play three songs now after two lessons.',
            )
            Review.objects.create(
                reviewer=carol,
                reviewed_user=alice,
                rating=4,
                comment='Great energy; would have liked a bit more structure on practice plans.',
            )

        self.stdout.write(self.style.SUCCESS('Demo data created.'))
        self.stdout.write(f'Password for all demo_* accounts: {DEMO_PASSWORD}')
        self.stdout.write('Log in as demo_alice, demo_bob, demo_carol, or demo_dave to explore Browse / My listings / Reviews.')
