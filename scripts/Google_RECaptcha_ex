Google RECaptcha example in Go

func login(w http.ResponseWriter, r * http.Request) {
	// Set up recaptcha data keys and URLs here
	r.ParseForm()

	// Rate limit via recaptcha
	if err: = recaptcha(r.PostForm.Get("recaptchaResponse"));
	err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check login credentials.
	if auth(r.PostForm.Get("username"), r.PostForm.Get("password")) == true {
		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
	} else {
		fmt.Fprint(w, "Incorrect Credentials Supplied")
		http.Redirect(w, r, "/login", http.StatusSeeOther)
	}
}

func recaptcha(response string) {
	// sent response to Google to verify (https://www.google.com/recaptcha/api/siteverify)

	if !body.Success {
		return errors.New("Unsuccessful attempt")
	}

	// If successful, and score is greater than 0.5, continue
	if response.Score < 0.5 {
		return errors.New("Unsuccessful attempt")
	}

	return nil
}