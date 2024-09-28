from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import SalesUser

class SalesUserCreationForm(forms.ModelForm):
    password = forms.CharField(label='Password',widget=forms.PasswordInput)

    class Meta:
        model = SalesUser
        fields = ('username','password','role')


        def save(self,commit=True):
            user = super().save(commit=False)
            user.set_password(self.cleaned_data["password"])  # 使用set_password方法加密
            if commit:
                user.save()
            return user